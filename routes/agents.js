const express = require('express');
const router = express.Router();
const CEOAgent = require('../agents/CEOAgent');
const ResearchAgent = require('../agents/ResearchAgent');
const ProductAgent = require('../agents/ProductAgent');
const CMOAgent = require('../agents/CMOAgent');
const CTOAgent = require('../agents/CTOAgent');
const HeadOfEngineeringAgent = require('../agents/HeadOfEngineeringAgent');
const db = require('../database/setup');

// Initialize agents
console.log('🔑 [DEBUG] ASI_ONE_API_KEY exists:', !!process.env.ASI_ONE_API_KEY);
console.log('🔑 [DEBUG] ASI_ONE_API_KEY length:', process.env.ASI_ONE_API_KEY?.length || 0);
console.log('🔑 [DEBUG] ASI_ONE_API_KEY starts with sk_:', process.env.ASI_ONE_API_KEY?.startsWith('sk_') || false);
const ceoAgent = new CEOAgent(process.env.ASI_ONE_API_KEY);
const researchAgent = new ResearchAgent(process.env.ASI_ONE_API_KEY);
const productAgent = new ProductAgent(process.env.ASI_ONE_API_KEY);
const cmoAgent = new CMOAgent(process.env.ASI_ONE_API_KEY);
const ctoAgent = new CTOAgent(process.env.ASI_ONE_API_KEY);
const headOfEngineeringAgent = new HeadOfEngineeringAgent(process.env.ASI_ONE_API_KEY);

// Generate ideas
router.post('/generate-ideas', async (req, res) => {
  try {
    const { count = 3 } = req.body;
    
    // Test API key directly
    console.log('🔑 [ROUTE] Testing API key directly...');
    console.log('🔑 [ROUTE] API Key length:', process.env.ASI_ONE_API_KEY?.length);
    console.log('🔑 [ROUTE] API Key starts with sk_:', process.env.ASI_ONE_API_KEY?.startsWith('sk_'));
    console.log('🔑 [ROUTE] API Key first 20 chars:', process.env.ASI_ONE_API_KEY?.substring(0, 20));
    console.log('🔑 [ROUTE] API Key last 20 chars:', process.env.ASI_ONE_API_KEY?.substring(-20));
    
    const ideas = await ceoAgent.generateIdeas(count);
    
    // Use Promise.all to wait for all database operations
    const savePromises = ideas.map(idea => {
      return new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO ideas (title, description, potential_revenue) VALUES (?, ?, ?)',
          [idea.title, idea.description, idea.revenue_model],
          function(err) {
            if (err) {
              reject(err);
            } else {
              // Get the saved idea with ID
              const ideaId = this.lastID;
              console.log('💾 [ROUTE] Saved idea with ID:', ideaId);
              db.get('SELECT * FROM ideas WHERE id = ?', [ideaId], (err, savedIdea) => {
                if (err) {
                  console.error('❌ [ROUTE] Error fetching saved idea:', err);
                  reject(err);
                } else {
                  console.log('✅ [ROUTE] Fetched saved idea:', savedIdea);
                  resolve(savedIdea);
                }
              });
            }
          }
        );
      });
    });
    
    const savedIdeas = await Promise.all(savePromises);
    res.json({ success: true, ideas: savedIdeas });
  } catch (error) {
    console.error('Error generating ideas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Research an idea (simple version without ID)
router.post('/research', async (req, res) => {
  try {
    const { idea } = req.body;
    console.log('🔍 [ROUTE] Research endpoint called for idea:', idea?.title);
    
    if (!idea) {
      return res.status(400).json({ success: false, error: 'Idea data is required' });
    }
    
    console.log('🔍 [ROUTE] Calling Research Agent...');
    const researchData = await researchAgent.researchIdea(idea);
    
    console.log('🔍 [ROUTE] Research Agent returned:', {
      competitors_count: researchData.competitors?.length || 0,
      market_size: researchData.market_analysis?.market_size,
      has_recommendations: !!researchData.recommendations
    });
    
    res.json({ success: true, research: researchData });
  } catch (error) {
    console.error('Error researching idea:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Research an idea (legacy version with ID)
router.post('/research/:ideaId', async (req, res) => {
  try {
    const { ideaId } = req.params;
    console.log('🔍 [ROUTE] Research endpoint called for idea ID:', ideaId);
    
    // Get idea from database
    db.get('SELECT * FROM ideas WHERE id = ?', [ideaId], async (err, idea) => {
      if (err) {
        console.error('❌ [ROUTE] Database error:', err);
        return res.status(500).json({ success: false, error: err.message });
      }
      
      if (!idea) {
        console.error('❌ [ROUTE] Idea not found for ID:', ideaId);
        return res.status(404).json({ success: false, error: 'Idea not found' });
      }
      
      console.log('🔍 [ROUTE] Found idea:', {
        id: idea.id,
        title: idea.title,
        description: idea.description?.substring(0, 100) + '...'
      });
      
      console.log('🔍 [ROUTE] Calling Research Agent...');
      const research = await researchAgent.researchIdea(idea);
      console.log('🔍 [ROUTE] Research Agent returned:', {
        competitors_count: research.competitors?.length || 0,
        market_size: research.market_analysis?.market_size || 'N/A',
        has_recommendations: !!research.recommendations
      });
      
      // Save research to database
      console.log('🔍 [ROUTE] Saving research to database...');
      db.run(
        'INSERT INTO research (idea_id, research_data, competitor_analysis, market_opportunity) VALUES (?, ?, ?, ?)',
        [ideaId, JSON.stringify(research), JSON.stringify(research.competitors), JSON.stringify(research.market_analysis)],
        function(err) {
          if (err) {
            console.error('❌ [ROUTE] Error saving research:', err);
          } else {
            console.log('✅ [ROUTE] Research saved successfully');
          }
        }
      );
      
      console.log('🔍 [ROUTE] Sending response to client...');
      res.json({ success: true, research });
    });
  } catch (error) {
    console.error('❌ [ROUTE] Error researching idea:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Develop product (simple version without ID)
router.post('/develop-product', async (req, res) => {
  try {
    const { idea, research } = req.body;
    console.log('🚀 [ROUTE] Product development endpoint called for idea:', idea?.title);
    
    if (!idea) {
      return res.status(400).json({ success: false, error: 'Idea data is required' });
    }
    
    console.log('🚀 [ROUTE] Calling Product Agent...');
    const productData = await productAgent.developProduct(idea, research);
    
    console.log('🚀 [ROUTE] Product Agent returned:', {
      product_name: productData.product_name,
      features_count: productData.features?.length || 0
    });
    
    res.json({ success: true, product: productData });
  } catch (error) {
    console.error('Error developing product:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Develop product (legacy version with ID)
router.post('/develop-product/:ideaId', async (req, res) => {
  try {
    const { ideaId } = req.params;
    
    // Get idea and research
    db.get('SELECT * FROM ideas WHERE id = ?', [ideaId], async (err, idea) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      
      db.get('SELECT * FROM research WHERE idea_id = ? ORDER BY created_at DESC LIMIT 1', [ideaId], async (err, research) => {
        if (err) {
          return res.status(500).json({ success: false, error: err.message });
        }
        
        const researchData = research ? JSON.parse(research.research_data) : {};
        const product = await productAgent.developProduct(idea, researchData);
        
        // Save product to database
        db.run(
          'INSERT INTO products (idea_id, product_name, product_description, features, target_market) VALUES (?, ?, ?, ?, ?)',
          [ideaId, product.product_name, product.product_description, JSON.stringify(product.core_features), JSON.stringify(product.target_market)],
          function(err) {
            if (err) console.error('Error saving product:', err);
          }
        );
        
        res.json({ success: true, product });
      });
    });
  } catch (error) {
    console.error('Error developing product:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Develop marketing strategy (simple version without ID)
router.post('/marketing-strategy', async (req, res) => {
  try {
    const { idea, product } = req.body;
    console.log('📢 [ROUTE] Marketing strategy endpoint called for product:', product?.product_name);
    
    if (!idea || !product) {
      return res.status(400).json({ success: false, error: 'Idea and product data are required' });
    }
    
    console.log('📢 [ROUTE] Calling CMO Agent...');
    const strategyData = await cmoAgent.developMarketingStrategy(idea, product, {});
    
    console.log('📢 [ROUTE] CMO Agent returned:', {
      channels_count: strategyData.marketing_channels?.length || 0,
      target_segments: strategyData.target_segments?.length || 0,
      has_launch_plan: !!strategyData.launch_plan
    });
    
    res.json({ success: true, strategy: strategyData });
  } catch (error) {
    console.error('Error developing marketing strategy:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Develop marketing strategy (legacy version with ID)
router.post('/marketing-strategy/:ideaId', async (req, res) => {
  try {
    const { ideaId } = req.params;
    
    // Get idea, research, and product
    db.get('SELECT * FROM ideas WHERE id = ?', [ideaId], async (err, idea) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      
      db.get('SELECT * FROM research WHERE idea_id = ? ORDER BY created_at DESC LIMIT 1', [ideaId], async (err, research) => {
        if (err) {
          return res.status(500).json({ success: false, error: err.message });
        }
        
        db.get('SELECT * FROM products WHERE idea_id = ? ORDER BY created_at DESC LIMIT 1', [ideaId], async (err, product) => {
          if (err) {
            return res.status(500).json({ success: false, error: err.message });
          }
          
          const researchData = research ? JSON.parse(research.research_data) : {};
          const productData = product ? {
            ...product,
            features: JSON.parse(product.features || '[]'),
            target_market: JSON.parse(product.target_market || '{}')
          } : {};
          
          const strategy = await cmoAgent.developMarketingStrategy(idea, productData, researchData);
          
          res.json({ success: true, strategy });
        });
      });
    });
  } catch (error) {
    console.error('Error developing marketing strategy:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Develop technical strategy (simple version without ID)
router.post('/technical-strategy', async (req, res) => {
  try {
    const { idea, product } = req.body;
    console.log('⚙️ [ROUTE] Technical strategy endpoint called for product:', product?.product_name);
    
    if (!idea || !product) {
      return res.status(400).json({ success: false, error: 'Idea and product data are required' });
    }
    
    console.log('⚙️ [ROUTE] Calling CTO Agent...');
    const strategyData = await ctoAgent.developTechnicalStrategy(idea, product, {});
    
    console.log('⚙️ [ROUTE] CTO Agent returned:', {
      tech_stack_count: Object.keys(strategyData.technology_stack || {}).length,
      phases_count: strategyData.development_phases?.length || 0,
      has_architecture: !!strategyData.architecture
    });
    
    res.json({ success: true, strategy: strategyData });
  } catch (error) {
    console.error('Error developing technical strategy:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Develop technical strategy (legacy version with ID)
router.post('/technical-strategy/:ideaId', async (req, res) => {
  try {
    const { ideaId } = req.params;
    
    // Get idea, research, and product
    db.get('SELECT * FROM ideas WHERE id = ?', [ideaId], async (err, idea) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      
      db.get('SELECT * FROM research WHERE idea_id = ? ORDER BY created_at DESC LIMIT 1', [ideaId], async (err, research) => {
        if (err) {
          return res.status(500).json({ success: false, error: err.message });
        }
        
        db.get('SELECT * FROM products WHERE idea_id = ? ORDER BY created_at DESC LIMIT 1', [ideaId], async (err, product) => {
          if (err) {
            return res.status(500).json({ success: false, error: err.message });
          }
          
          const researchData = research ? JSON.parse(research.research_data) : {};
          const productData = product ? {
            ...product,
            features: JSON.parse(product.features || '[]'),
            target_market: JSON.parse(product.target_market || '{}')
          } : {};
          
          const strategy = await ctoAgent.developTechnicalStrategy(idea, productData, researchData);
          
          res.json({ success: true, strategy });
        });
      });
    });
  } catch (error) {
    console.error('Error developing technical strategy:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create Bolt prompt for website development (simple version without ID)
router.post('/bolt-prompt', async (req, res) => {
  try {
    const { idea, product, research, marketingStrategy, technicalStrategy } = req.body;
    console.log('🔧 [ROUTE] Bolt prompt endpoint called for product:', product?.product_name);
    
    if (!idea || !product) {
      return res.status(400).json({ success: false, error: 'Idea and product data are required' });
    }
    
    console.log('🔧 [ROUTE] Calling Head of Engineering Agent...');
    const boltPromptData = await headOfEngineeringAgent.createBoltPrompt(
      idea, 
      product, 
      research, 
      marketingStrategy, 
      technicalStrategy
    );
    
    console.log('🔧 [ROUTE] Head of Engineering Agent returned:', {
      website_title: boltPromptData.website_title,
      pages_count: boltPromptData.pages_required?.length || 0,
      features_count: boltPromptData.functional_requirements?.length || 0
    });
    
    res.json({ success: true, boltPrompt: boltPromptData });
  } catch (error) {
    console.error('Error creating Bolt prompt:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create Bolt prompt for website development (legacy version with ID)
router.post('/bolt-prompt/:ideaId', async (req, res) => {
  try {
    const { ideaId } = req.params;
    
    // Get idea, research, product, marketing strategy, and technical strategy
    db.get('SELECT * FROM ideas WHERE id = ?', [ideaId], async (err, idea) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      
      if (!idea) {
        return res.status(404).json({ success: false, error: 'Idea not found' });
      }
      
      db.get('SELECT * FROM research WHERE idea_id = ? ORDER BY created_at DESC LIMIT 1', [ideaId], async (err, research) => {
        if (err) {
          return res.status(500).json({ success: false, error: err.message });
        }
        
        db.get('SELECT * FROM products WHERE idea_id = ? ORDER BY created_at DESC LIMIT 1', [ideaId], async (err, product) => {
          if (err) {
            return res.status(500).json({ success: false, error: err.message });
          }
          
          const researchData = research ? JSON.parse(research.research_data) : {};
          const productData = product ? {
            ...product,
            features: JSON.parse(product.features || '[]'),
            target_market: JSON.parse(product.target_market || '{}')
          } : {};
          
          // For now, we'll use placeholder marketing and technical strategies
          // In a real implementation, these would be fetched from the database
          const marketingStrategy = {
            brand_positioning: 'Innovative solution for modern problems',
            key_messages: ['Revolutionary approach', 'User-friendly design'],
            target_segments: [{ segment: 'Tech professionals', characteristics: 'Innovation-focused' }],
            marketing_channels: [{ channel: 'Digital Marketing', strategy: 'Online presence' }]
          };
          
          const technicalStrategy = {
            technology_stack: { frontend: 'React', backend: 'Node.js' },
            architecture: { overview: 'Modern web architecture' },
            timeline: { phases: [{ phase: 'Development', duration: '3 months' }] }
          };
          
          const boltPrompt = await headOfEngineeringAgent.createBoltPrompt(idea, productData, researchData, marketingStrategy, technicalStrategy);
          
          // Save bolt prompt to database
          const stmt = db.prepare(`
            INSERT INTO bolt_prompts (
              idea_id, website_title, website_description, pages_required,
              functional_requirements, design_guidelines, integration_needs, bolt_prompt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);
          
          stmt.run([
            ideaId,
            boltPrompt.website_title || '',
            boltPrompt.website_description || '',
            JSON.stringify(boltPrompt.pages_required || []),
            JSON.stringify(boltPrompt.functional_requirements || []),
            boltPrompt.design_guidelines || '',
            JSON.stringify(boltPrompt.integration_needs || []),
            boltPrompt.bolt_prompt || ''
          ], function(err) {
            if (err) {
              console.error('Error saving bolt prompt:', err);
              return res.status(500).json({ success: false, error: err.message });
            }
            
            console.log(`Bolt prompt saved for idea ${ideaId}, prompt ID: ${this.lastID}`);
            res.json({ success: true, boltPrompt });
          });
          
          stmt.finalize();
        });
      });
    });
  } catch (error) {
    console.error('Error creating Bolt prompt:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test API key endpoint
router.get('/test-api-key', (req, res) => {
  const apiKey = process.env.ASI_ONE_API_KEY;
  
  // Log the API key details
  console.log('🔑 [TEST] API Key exists:', !!apiKey);
  console.log('🔑 [TEST] API Key length:', apiKey?.length || 0);
  console.log('🔑 [TEST] API Key starts with sk-ant:', apiKey?.startsWith('sk-ant') || false);
  console.log('🔑 [TEST] API Key first 20 chars:', apiKey?.substring(0, 20) || 'undefined');
  console.log('🔑 [TEST] API Key last 20 chars:', apiKey?.substring(-20) || 'undefined');
  
  // Check for hidden characters
  const hasNewlines = apiKey?.includes('\n') || apiKey?.includes('\r');
  const hasSpaces = apiKey?.includes(' ');
  const hasTabs = apiKey?.includes('\t');
  
  console.log('🔑 [TEST] Has newlines:', hasNewlines);
  console.log('🔑 [TEST] Has spaces:', hasSpaces);
  console.log('🔑 [TEST] Has tabs:', hasTabs);
  
  res.json({
    success: true,
    apiKey: {
      exists: !!apiKey,
      length: apiKey?.length || 0,
      startsWithSkAnt: apiKey?.startsWith('sk-ant') || false,
      first20Chars: apiKey?.substring(0, 20) || 'undefined',
      last20Chars: apiKey?.substring(-20) || 'undefined',
      hasNewlines: hasNewlines,
      hasSpaces: hasSpaces,
      hasTabs: hasTabs
    }
  });
});

// Test ASI:One API directly
router.get('/test-asi-one-api', async (req, res) => {
  const axios = require('axios');
  const apiKey = process.env.ASI_ONE_API_KEY;
  
  try {
    console.log('🔑 [ASI_ONE_TEST] Testing ASI:One API directly...');
    console.log('🔑 [ASI_ONE_TEST] API Key length:', apiKey?.length);
    console.log('🔑 [ASI_ONE_TEST] API Key starts with sk_:', apiKey?.startsWith('sk_'));
    
    const response = await axios.post('https://api.asi1.ai/v1/chat/completions', {
      model: 'asi1-mini',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: 'Hello, this is a test message.'
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('🔑 [ASI_ONE_TEST] ASI:One API response:', response.data);
    res.json({ success: true, response: response.data });
    
  } catch (error) {
    console.error('🔑 [ASI_ONE_TEST] ASI:One API error:', error.response?.data || error.message);
    res.json({ 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status
    });
  }
});

// Get agent activities
router.get('/activities', (req, res) => {
  db.all('SELECT * FROM agent_activities ORDER BY created_at DESC LIMIT 50', (err, activities) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, activities });
  });
});

module.exports = router;
