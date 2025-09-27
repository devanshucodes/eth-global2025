"""
CEO uAgent for AI Company
Generates business ideas and evaluates product concepts
"""

import json
from typing import List, Dict, Any
from uagents import Context, Model
from base_uagent import BaseUAgent

class GenerateIdeas(Model):
    """Model for generating business ideas"""
    count: int = 3

class BusinessIdea(Model):
    """Model for business idea structure"""
    title: str
    description: str
    revenue_model: str
    success_factors: str

class IdeasResponse(Model):
    """Model for ideas response"""
    ideas: List[BusinessIdea]

class EvaluateProduct(Model):
    """Model for product evaluation request"""
    product_name: str
    product_description: str
    features: List[str]
    target_market: Dict[str, str]

class ProductEvaluation(Model):
    """Model for product evaluation response"""
    viability_score: int
    market_potential: str
    recommendations: str
    go_decision: bool

class CEOuAgent(BaseUAgent):
    """CEO uAgent for strategic decision making and idea generation"""
    
    def __init__(self):
        super().__init__(
            name="CEO Agent",
            role="Strategic decision making and idea generation",
            port=8001
        )
        self.setup_handlers()
    
    def setup_handlers(self):
        """Setup message handlers for the agent"""
        
        @self.agent.on_message(model=GenerateIdeas)
        async def handle_generate_ideas(ctx: Context, sender: str, msg: GenerateIdeas):
            """Generate business ideas"""
            try:
                print(f"🧠 [{ceo_agent.name}] Generating {msg.count} business ideas...")
                
                prompt = f"""You are a visionary CEO of an AI company. Generate {msg.count} innovative business ideas that could potentially generate $1 million in revenue.

For each idea, provide:
1. A catchy title
2. A brief description (2-3 sentences)
3. Potential revenue model
4. Why it could be successful

Format your response as JSON with this structure:
{{
  "ideas": [
    {{
      "title": "Idea Title",
      "description": "Brief description",
      "revenue_model": "How it makes money",
      "success_factors": "Why it could work"
    }}
  ]
}}"""

                response = await ceo_agent.call_asi_one(prompt, 2000)
                
                # Parse JSON response
                try:
                    ideas_data = json.loads(response)
                except json.JSONDecodeError:
                    # Try to extract JSON from response
                    import re
                    json_match = re.search(r'\{[\s\S]*\}', response)
                    if json_match:
                        ideas_data = json.loads(json_match.group())
                    else:
                        raise ValueError("Could not parse JSON from response")
                
                ideas = [BusinessIdea(**idea) for idea in ideas_data.get('ideas', [])]
                
                ceo_agent.log_activity('Generated business ideas', {
                    'count': len(ideas),
                    'sender': sender
                })
                
                # Send response back
                await ctx.send(sender, IdeasResponse(ideas=ideas))
                
            except Exception as e:
                print(f"❌ [{ceo_agent.name}] Error generating ideas: {str(e)}")
                # Send error response
                await ctx.send(sender, IdeasResponse(ideas=[]))
        
        @self.agent.on_message(model=EvaluateProduct)
        async def handle_evaluate_product(ctx: Context, sender: str, msg: EvaluateProduct):
            """Evaluate product concept for market viability"""
            try:
                print(f"🧠 [{ceo_agent.name}] Evaluating product: {msg.product_name}")
                
                prompt = f"""As a CEO, evaluate this product concept for market viability:

Product: {msg.product_name}
Description: {msg.product_description}
Features: {', '.join(msg.features)}
Target Market: {json.dumps(msg.target_market)}

Provide your assessment in JSON format:
{{
  "viability_score": 1-10,
  "market_potential": "High/Medium/Low",
  "recommendations": "What to improve",
  "go_decision": true/false
}}"""

                response = await ceo_agent.call_asi_one(prompt, 1000)
                
                # Parse JSON response
                try:
                    evaluation_data = json.loads(response)
                except json.JSONDecodeError:
                    # Try to extract JSON from response
                    import re
                    json_match = re.search(r'\{[\s\S]*\}', response)
                    if json_match:
                        evaluation_data = json.loads(json_match.group())
                    else:
                        raise ValueError("Could not parse JSON from response")
                
                evaluation = ProductEvaluation(**evaluation_data)
                
                ceo_agent.log_activity('Evaluated product', {
                    'product_name': msg.product_name,
                    'viability_score': evaluation.viability_score,
                    'go_decision': evaluation.go_decision,
                    'sender': sender
                })
                
                # Send response back
                await ctx.send(sender, evaluation)
                
            except Exception as e:
                print(f"❌ [{ceo_agent.name}] Error evaluating product: {str(e)}")
                # Send error response with default values
                error_evaluation = ProductEvaluation(
                    viability_score=0,
                    market_potential="Low",
                    recommendations="Evaluation failed",
                    go_decision=False
                )
                await ctx.send(sender, error_evaluation)
        
        # REST endpoints for Node.js server integration
        @self.agent.on_rest_post("/generate-ideas", GenerateIdeas, IdeasResponse)
        async def handle_generate_ideas_rest(ctx: Context, req: GenerateIdeas) -> IdeasResponse:
            """REST endpoint for generating business ideas"""
            try:
                print(f"🧠 [{self.name}] REST: Generating {req.count} business ideas...")
                
                prompt = f"""You are a visionary CEO of an AI company. Generate {req.count} innovative business ideas that could potentially generate $1 million in revenue.

For each idea, provide:
1. A catchy title
2. A brief description (2-3 sentences)
3. Potential revenue model
4. Why it could be successful

Format your response as JSON with this structure:
{{
  "ideas": [
    {{
      "title": "Idea Title",
      "description": "Brief description",
      "revenue_model": "How it makes money",
      "success_factors": "Why it could work"
    }}
  ]
}}"""

                response = await self.call_asi_one(prompt, 2000)
                
                # Parse JSON response
                try:
                    ideas_data = json.loads(response)
                except json.JSONDecodeError:
                    # Try to extract JSON from response
                    import re
                    json_match = re.search(r'\{[\s\S]*\}', response)
                    if json_match:
                        ideas_data = json.loads(json_match.group())
                    else:
                        raise ValueError("Could not parse JSON from response")
                
                ideas = [BusinessIdea(**idea) for idea in ideas_data.get('ideas', [])]
                
                self.log_activity('REST: Generated business ideas', {
                    'count': len(ideas)
                })
                
                return IdeasResponse(ideas=ideas)
                
            except Exception as e:
                print(f"❌ [{self.name}] REST: Error generating ideas: {str(e)}")
                return IdeasResponse(ideas=[])
        
        @self.agent.on_rest_post("/evaluate-product", EvaluateProduct, ProductEvaluation)
        async def handle_evaluate_product_rest(ctx: Context, req: EvaluateProduct) -> ProductEvaluation:
            """REST endpoint for product evaluation"""
            try:
                print(f"🧠 [{self.name}] REST: Evaluating product: {req.product_name}")
                
                prompt = f"""As a CEO, evaluate this product concept for market viability:

Product: {req.product_name}
Description: {req.product_description}
Features: {', '.join(req.features)}
Target Market: {json.dumps(req.target_market)}

Provide your assessment in JSON format:
{{
  "viability_score": 1-10,
  "market_potential": "High/Medium/Low",
  "recommendations": "What to improve",
  "go_decision": true/false
}}"""

                response = await self.call_asi_one(prompt, 1000)
                
                # Parse JSON response
                try:
                    evaluation_data = json.loads(response)
                except json.JSONDecodeError:
                    # Try to extract JSON from response
                    import re
                    json_match = re.search(r'\{[\s\S]*\}', response)
                    if json_match:
                        evaluation_data = json.loads(json_match.group())
                    else:
                        raise ValueError("Could not parse JSON from response")
                
                evaluation = ProductEvaluation(**evaluation_data)
                
                self.log_activity('REST: Evaluated product', {
                    'product_name': req.product_name,
                    'viability_score': evaluation.viability_score,
                    'go_decision': evaluation.go_decision
                })
                
                return evaluation
                
            except Exception as e:
                print(f"❌ [{self.name}] REST: Error evaluating product: {str(e)}")
                return ProductEvaluation(
                    viability_score=0,
                    market_potential="Low",
                    recommendations="Evaluation failed",
                    go_decision=False
                )

# Create the agent instance
ceo_agent = CEOuAgent()

if __name__ == "__main__":
    print(f"🚀 Starting CEO uAgent on port {ceo_agent.port}")
    print(f"📍 Agent address: {ceo_agent.get_agent_address()}")
    print(f"🌐 Agentverse registration: Enabled")
    ceo_agent.agent.run()
