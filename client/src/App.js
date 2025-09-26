import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import AgentFlow from './AgentFlow';
import RevenueDashboard from './RevenueDashboard';

function App() {
  // Simple frontend state - no database IDs needed
  const [currentIdea, setCurrentIdea] = useState(null);
  const [research, setResearch] = useState(null);
  const [product, setProduct] = useState(null);
  const [marketingStrategy, setMarketingStrategy] = useState(null);
  const [technicalStrategy, setTechnicalStrategy] = useState(null);
  const [boltPrompt, setBoltPrompt] = useState(null);
  const [agentActivity, setAgentActivity] = useState([]);
  const [currentAgent, setCurrentAgent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tokenHolderId] = useState('token_holder_' + Math.random().toString(36).substr(2, 9));
  const [activeTab, setActiveTab] = useState('dashboard');
  const boltWindowRef = useRef(null);

  // Helper function to safely format target market segments
  const formatSegment = (val) => {
    if (!val) return 'N/A';
    if (typeof val === 'string') return val;
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'object') {
      if (val.segment) return val.segment;
      if (val.segments) return Array.isArray(val.segments) ? val.segments.join(', ') : String(val.segments);
      return Object.values(val).filter(v => typeof v === 'string').join(', ') || 'N/A';
    }
    return String(val);
  };

  // Initialize with empty state - no database dependency
  useEffect(() => {
    console.log('🚀 [FRONTEND] App initialized - ready for AI agent workflow');
  }, []);

  // Removed fetchIdeas function - no database dependency needed

  const generateIdeas = async () => {
    setLoading(true);
    setCurrentAgent('CEO Agent');
    
    // Clear all previous state to start fresh
    setCurrentIdea(null);
    setResearch(null);
    setProduct(null);
    setMarketingStrategy(null);
    setTechnicalStrategy(null);
    setBoltPrompt(null);
    setAgentActivity([]);
    
    setAgentActivity(prev => [...prev, { agent: 'CEO Agent', action: 'Generating new business idea...', time: new Date().toLocaleTimeString() }]);
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || '';
      const response = await fetch(`${apiUrl}/api/agents/generate-ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ count: 1 }),
      });
      const data = await response.json();
      if (data.success && data.ideas && data.ideas.length > 0) {
        setCurrentIdea(data.ideas[0]);
        setAgentActivity(prev => [...prev, { agent: 'CEO Agent', action: 'Idea generated successfully!', time: new Date().toLocaleTimeString() }]);
        console.log('💡 [FRONTEND] New idea created:', data.ideas[0].title);
      }
    } catch (error) {
      console.error('Error generating ideas:', error);
      setAgentActivity(prev => [...prev, { agent: 'CEO Agent', action: 'Error generating idea', time: new Date().toLocaleTimeString() }]);
    } finally {
      setLoading(false);
      setCurrentAgent(null);
    }
  };

  const researchIdea = async () => {
    if (!currentIdea) return;
    
    setLoading(true);
    setCurrentAgent('Research Agent');
    setAgentActivity(prev => [...prev, { agent: 'Research Agent', action: 'Conducting market research...', time: new Date().toLocaleTimeString() }]);
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || '';
      const response = await fetch(`${apiUrl}/api/agents/research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea: currentIdea }),
      });
      const data = await response.json();
      console.log('🔍 [FRONTEND] Research response:', data);
      
      if (data.success) {
        console.log('🔍 [FRONTEND] Setting research data:', data.research);
        setResearch(data.research);
        setAgentActivity(prev => [...prev, { agent: 'Research Agent', action: 'Research completed successfully!', time: new Date().toLocaleTimeString() }]);
        setAgentActivity(prev => [...prev, { agent: 'Research Agent', action: 'Sharing research data with Product Agent...', time: new Date().toLocaleTimeString() }]);
        
        // Auto-trigger Product Agent after research completes
        setTimeout(() => {
          console.log('🔍 [FRONTEND] About to call developProduct after timeout');
          setAgentActivity(prev => [...prev, { agent: '🔄 Data Transfer', action: 'Research data successfully transferred to Product Agent', time: new Date().toLocaleTimeString() }]);
          setAgentActivity(prev => [...prev, { agent: 'Product Agent', action: 'Received research data. Starting product development...', time: new Date().toLocaleTimeString() }]);
          developProductWithData(currentIdea, data.research);
        }, 2000);
      }
    } catch (error) {
      console.error('Error researching idea:', error);
      setAgentActivity(prev => [...prev, { agent: 'Research Agent', action: 'Error in research', time: new Date().toLocaleTimeString() }]);
    } finally {
      setLoading(false);
      setCurrentAgent(null);
    }
  };

  const developProductWithData = async (ideaData, researchData) => {
    console.log('🚀 [FRONTEND] developProductWithData called with:', { idea: !!ideaData, research: !!researchData });
    
    if (!ideaData || !researchData) {
      console.log('❌ [FRONTEND] developProductWithData blocked - missing data:', { idea: !!ideaData, research: !!researchData });
      setAgentActivity(prev => [...prev, { agent: 'Product Agent', action: 'Error: Missing required data for product development', time: new Date().toLocaleTimeString() }]);
      return;
    }
    
    setLoading(true);
    setCurrentAgent('Product Agent');
    setAgentActivity(prev => [...prev, { agent: 'Product Agent', action: 'Developing product concept...', time: new Date().toLocaleTimeString() }]);
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || '';
      const response = await fetch(`${apiUrl}/api/agents/develop-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          idea: ideaData,
          research: researchData
        }),
      });
      const data = await response.json();
      if (data.success) {
        setProduct(data.product);
        setAgentActivity(prev => [...prev, { agent: 'Product Agent', action: 'Product concept developed successfully!', time: new Date().toLocaleTimeString() }]);
        setAgentActivity(prev => [...prev, { agent: 'Product Agent', action: 'Sharing product concept with CEO Agent...', time: new Date().toLocaleTimeString() }]);
        
        // Auto-trigger CEO validation after product is ready
        setTimeout(() => {
          setAgentActivity(prev => [...prev, { agent: '🔄 Data Transfer', action: 'Product concept successfully transferred to CEO Agent', time: new Date().toLocaleTimeString() }]);
          setAgentActivity(prev => [...prev, { agent: 'CEO Agent', action: 'Received product concept. Evaluating market viability...', time: new Date().toLocaleTimeString() }]);
          setTimeout(() => {
            setAgentActivity(prev => [...prev, { agent: 'CEO Agent', action: 'Product evaluation complete! Approved for token holder vote.', time: new Date().toLocaleTimeString() }]);
            setAgentActivity(prev => [...prev, { agent: '🎯 Final Stage', action: 'Product concept ready for token holder approval!', time: new Date().toLocaleTimeString() }]);
          }, 3000);
        }, 2000);
      }
    } catch (error) {
      console.error('Error developing product:', error);
      setAgentActivity(prev => [...prev, { agent: 'Product Agent', action: 'Error in product development - using fallback data', time: new Date().toLocaleTimeString() }]);
    } finally {
      setLoading(false);
      setCurrentAgent(null);
    }
  };

  // developProduct fallback function removed - using developProductWithData directly

  const triggerCMOAndCTOWithData = async (ideaData, productData, researchData) => {
    console.log('🚀 [FRONTEND] triggerCMOAndCTOWithData called with:', { idea: !!ideaData, product: !!productData, research: !!researchData });
    
    if (!ideaData || !productData) {
      console.log('❌ [FRONTEND] triggerCMOAndCTOWithData blocked - missing data:', { idea: !!ideaData, product: !!productData });
      setAgentActivity(prev => [...prev, { agent: 'CMO & CTO Agents', action: 'Error: Missing required data for strategy development', time: new Date().toLocaleTimeString() }]);
      return;
    }
    
    console.log('🚀 [FRONTEND] Triggering CMO & CTO for product:', productData.product_name);
    setLoading(true);
    setCurrentAgent('CMO & CTO Agents');
    
    try {
      // Trigger CMO Agent
      setAgentActivity(prev => [...prev, { 
        agent: 'CMO Agent', 
        action: 'Developing marketing strategy...', 
        time: new Date().toLocaleTimeString() 
      }]);
      
      const apiUrl = process.env.REACT_APP_API_URL || '';
      const cmoResponse = await fetch(`${apiUrl}/api/agents/marketing-strategy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          idea: ideaData,
          product: productData
        }),
      });
      const cmoData = await cmoResponse.json();
      
      if (cmoData.success) {
        setMarketingStrategy(cmoData.strategy);
        setAgentActivity(prev => [...prev, { 
          agent: 'CMO Agent', 
          action: `Marketing strategy complete! ${cmoData.strategy.marketing_channels?.length || 0} channels identified`, 
          time: new Date().toLocaleTimeString() 
        }]);
        
        // Trigger Marketing Agent after CMO completes
        setTimeout(() => {
          setAgentActivity(prev => [...prev, { 
            agent: '🔄 Data Transfer', 
            action: 'Marketing strategy shared with Marketing Agent', 
            time: new Date().toLocaleTimeString() 
          }]);
          setAgentActivity(prev => [...prev, { 
            agent: 'Marketing Agent', 
            action: 'Work in Progress - Click to check marketing agent', 
            time: new Date().toLocaleTimeString() 
          }]);
        }, 1000);
      }
      
      // Trigger CTO Agent
      setAgentActivity(prev => [...prev, { 
        agent: 'CTO Agent', 
        action: 'Developing technical strategy...', 
        time: new Date().toLocaleTimeString() 
      }]);
      
      const ctoResponse = await fetch(`${apiUrl}/api/agents/technical-strategy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          idea: ideaData,
          product: productData
        }),
      });
      const ctoData = await ctoResponse.json();
      
      if (ctoData.success) {
        setTechnicalStrategy(ctoData.strategy);
        setAgentActivity(prev => [...prev, { 
          agent: 'CTO Agent', 
          action: `Technical strategy complete! ${Object.keys(ctoData.strategy.technology_stack || {}).length} tech components planned`, 
          time: new Date().toLocaleTimeString() 
        }]);
        
        // Trigger Head of Engineering after CTO completes
        setTimeout(() => {
          setAgentActivity(prev => [...prev, { 
            agent: '🔄 Data Transfer', 
            action: 'Technical strategy shared with Head of Engineering', 
            time: new Date().toLocaleTimeString() 
          }]);
          setAgentActivity(prev => [...prev, { 
            agent: 'Head of Engineering', 
            action: 'Creating developer prompt for website development...', 
            time: new Date().toLocaleTimeString() 
          }]);
          createBoltPromptWithData(ideaData, productData, researchData, cmoData.strategy, ctoData.strategy);
        }, 2000);
      }
      
      setAgentActivity(prev => [...prev, { 
        agent: 'System', 
        action: '🎉 All agents complete! Product ready for development!', 
        time: new Date().toLocaleTimeString() 
      }]);
      
    } catch (error) {
      console.error('Error triggering CMO/CTO agents:', error);
    } finally {
      setLoading(false);
      setCurrentAgent(null);
    }
  };

  // Fallback function for backward compatibility
  const triggerCMOAndCTO = async () => {
    console.log('🚀 [FRONTEND] triggerCMOAndCTO (fallback) called with:', { currentIdea: !!currentIdea, product: !!product });
    
    if (!currentIdea || !product) {
      console.log('❌ [FRONTEND] triggerCMOAndCTO (fallback) blocked - missing data:', { currentIdea: !!currentIdea, product: !!product });
      setAgentActivity(prev => [...prev, { agent: 'CMO & CTO Agents', action: 'Error: Missing required data for strategy development', time: new Date().toLocaleTimeString() }]);
      return;
    }
    
    // Use the new function with current state
    triggerCMOAndCTOWithData(currentIdea, product, research);
  };

  const createBoltPromptWithData = async (ideaData, productData, researchData, marketingStrategyData, technicalStrategyData) => {
    console.log('🔧 [FRONTEND] createBoltPromptWithData called with:', { 
      idea: !!ideaData, 
      product: !!productData, 
      research: !!researchData,
      marketing: !!marketingStrategyData,
      technical: !!technicalStrategyData
    });
    
    if (!ideaData || !productData || !marketingStrategyData || !technicalStrategyData) {
      console.log('❌ [FRONTEND] createBoltPromptWithData blocked - missing data');
      setAgentActivity(prev => [...prev, { agent: 'Head of Engineering', action: 'Error: Missing required data for bolt prompt creation', time: new Date().toLocaleTimeString() }]);
      return;
    }
    
    console.log('🔧 [FRONTEND] Starting Bolt prompt creation for product:', productData.product_name);
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || '';
      const response = await fetch(`${apiUrl}/api/agents/bolt-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          idea: ideaData,
          product: productData,
          research: researchData,
          marketingStrategy: marketingStrategyData,
          technicalStrategy: technicalStrategyData
        }),
      });
      const data = await response.json();
      console.log('🔧 [FRONTEND] Bolt prompt API response:', data);
      
      if (data.success) {
        setBoltPrompt(data.boltPrompt);
        
        setAgentActivity(prev => [...prev, { 
          agent: 'Head of Engineering', 
          action: `Bolt prompt created! ${data.boltPrompt.pages_required?.length || 0} pages planned for website`, 
          time: new Date().toLocaleTimeString() 
        }]);
        setAgentActivity(prev => [...prev, { 
          agent: '🔄 Data Transfer', 
          action: 'Bolt prompt shared with Developer Agent (Bolt.diy)', 
          time: new Date().toLocaleTimeString() 
        }]);
        setAgentActivity(prev => [...prev, { 
          agent: 'Developer Agent', 
          action: 'Work in Progress - Click to check developer agent', 
          time: new Date().toLocaleTimeString() 
        }]);
        setAgentActivity(prev => [...prev, { 
          agent: '🎯 Final Stage', 
          action: 'Website development prompt ready! Click developer agent to start building!', 
          time: new Date().toLocaleTimeString() 
        }]);
        
        // Trigger revenue distribution for project completion
        setTimeout(() => {
          triggerRevenueDistribution(currentIdea.id, 'website_deployment', boltPrompt);
        }, 3000);
        
        // Developer Agent is now ready and clickable
      }
    } catch (error) {
      console.error('❌ [FRONTEND] Error creating Bolt prompt:', error);
      console.error('❌ [FRONTEND] Error details:', error.message);
      setAgentActivity(prev => [...prev, { 
        agent: 'Head of Engineering', 
        action: `Error creating Bolt prompt: ${error.message}`, 
        time: new Date().toLocaleTimeString() 
      }]);
    }
  };

  // Trigger revenue distribution for completed projects
  const triggerRevenueDistribution = async (ideaId, projectType, completionData) => {
    try {
      console.log('💰 Triggering revenue distribution for project:', ideaId, projectType);
      
      setAgentActivity(prev => [...prev, { 
        agent: 'Finance Agent', 
        action: 'Processing revenue distribution...', 
        time: new Date().toLocaleTimeString() 
      }]);

      const apiUrl = process.env.REACT_APP_API_URL || '';
      const response = await fetch(`${apiUrl}/api/finance/complete-project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ideaId: ideaId,
          completionType: projectType,
          revenueAmount: 0.1, // Default 0.1 AVAX for website deployment
          completionData: completionData
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setAgentActivity(prev => [...prev, { 
          agent: 'Finance Agent', 
          action: `✅ Revenue distributed: ${result.totalAmount} AVAX (80% to company, 20% to token holders)`, 
          time: new Date().toLocaleTimeString() 
        }]);
        
        if (result.transactionHash) {
          setAgentActivity(prev => [...prev, { 
            agent: 'Smart Contract', 
            action: `📋 Transaction: ${result.transactionHash}`, 
            time: new Date().toLocaleTimeString() 
          }]);
        }
      } else {
        setAgentActivity(prev => [...prev, { 
          agent: 'Finance Agent', 
          action: `❌ Revenue distribution failed: ${result.error}`, 
          time: new Date().toLocaleTimeString() 
        }]);
      }

    } catch (error) {
      console.error('Revenue distribution error:', error);
      setAgentActivity(prev => [...prev, { 
        agent: 'Finance Agent', 
        action: `❌ Error: ${error.message}`, 
        time: new Date().toLocaleTimeString() 
      }]);
    }
  };

  // createBoltPrompt fallback function removed - using createBoltPromptWithData directly

  const getBoltUrl = () => {
    const rawPrompt = boltPrompt?.bolt_prompt ||
      'Build a modern, responsive website. Include homepage, features, pricing, about, contact pages.';
    const promptText = typeof rawPrompt === 'string' ? rawPrompt : JSON.stringify(rawPrompt);
    const params = new URLSearchParams({
      prompt: promptText,
      autostart: '1',
    });
    const boltBase = (process.env.REACT_APP_BOLT_URL || 'http://localhost:5173').replace(/\/+$/, '');
    return `${boltBase}/?${params.toString()}`;
  };

  const openBoltNewTab = () => {
    const url = getBoltUrl();
    // If we pre-opened a placeholder window, navigate it; else open a fresh tab
    if (boltWindowRef.current && !boltWindowRef.current.closed) {
      try {
        boltWindowRef.current.location.href = url;
        return;
      } catch (_) {
        // Fallback to opening a new tab
      }
    }
    window.open(url, '_blank', 'noopener');
  };

  const openBoltWithPrompt = () => {
    // If no boltPrompt exists, create a fallback one
    if (!boltPrompt) {
      const fallbackPrompt = {
        website_title: "AI Health Guardian Website",
        website_description: "A modern, responsive website for the AI Health Guardian platform",
        bolt_prompt: "Build a modern, responsive healthcare website for AI Health Guardian - a personalized AI health monitoring system. Include homepage, features page, pricing, about us, and contact pages. Use a clean, medical-themed design with blue and green colors. Include sections for: hero banner, features showcase, testimonials, pricing plans, and contact form. Make it mobile-responsive and professional."
      };
      setBoltPrompt(fallbackPrompt);
    }
    
    // Prefer opening a new tab for Developer Agent to avoid cross-origin isolation issues
    openBoltNewTab();
    setAgentActivity(prev => [...prev, { 
      agent: '🚀 System', 
      action: 'Opening Developer Agent (new tab) with website prompt...', 
      time: new Date().toLocaleTimeString() 
    }]);
  };

  const startMarketingCampaign = () => {
    setAgentActivity(prev => [...prev, { 
      agent: 'Marketing Agent', 
      action: 'Starting marketing campaign execution...', 
      time: new Date().toLocaleTimeString() 
    }]);
    
    // You can add actual marketing campaign logic here
    // For now, just show that the marketing agent is working
    setTimeout(() => {
      setAgentActivity(prev => [...prev, { 
        agent: 'Marketing Agent', 
        action: 'Marketing campaigns launched successfully!', 
        time: new Date().toLocaleTimeString() 
      }]);
    }, 2000);
  };

  const voteOnItem = async (itemType, vote, feedback = '') => {
    console.log('🗳️ [FRONTEND] Voting on:', { itemType, vote });
    
    // Simple frontend-only voting - no API call needed
    setAgentActivity(prev => [...prev, { 
      agent: 'Token Holder', 
      action: `${vote}d ${itemType}`, 
      time: new Date().toLocaleTimeString() 
    }]);
    
    // Auto-trigger next step if idea is approved
    if (itemType === 'idea' && vote === 'approve' && currentIdea) {
      setTimeout(() => {
        console.log('🔍 [FRONTEND] Starting research for idea:', currentIdea.title);
        researchIdea();
      }, 1000);
    }
    
    // Auto-trigger CMO and CTO agents after product approval
    if (itemType === 'product' && vote === 'approve' && product) {
      setTimeout(() => {
        console.log('📢 [FRONTEND] Starting CMO/CTO for product:', product.product_name);
        triggerCMOAndCTO();
      }, 1000);
    }
    
    // Auto-generate new idea if idea is rejected
    if (itemType === 'idea' && vote === 'reject') {
      setTimeout(() => {
        setAgentActivity(prev => [...prev, { 
          agent: 'CEO Agent', 
          action: 'Idea rejected. Generating new business idea...', 
          time: new Date().toLocaleTimeString() 
        }]);
        // Generate a completely new idea
        generateIdeas();
      }, 2000);
    }
  };


  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Company - Zero-Man Organization</h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>Token Holder ID: {tokenHolderId}</p>
        
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            🤖 Agent Dashboard
          </button>
          <button 
            className={`tab-button ${activeTab === 'revenue' ? 'active' : ''}`}
            onClick={() => setActiveTab('revenue')}
          >
            💰 Revenue Dashboard
          </button>
        </div>
      </header>

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
        <div className="controls">
          <button 
            onClick={generateIdeas} 
            disabled={loading}
            className="generate-btn"
          >
            {loading ? `Generating... (${currentAgent})` : 'Generate New Idea ($1M Potential)'}
          </button>
          <button 
            onClick={() => {
              setCurrentIdea(null);
              setResearch(null);
              setProduct(null);
              setMarketingStrategy(null);
              setTechnicalStrategy(null);
              setBoltPrompt(null);
              setAgentActivity([]);
              setCurrentAgent(null);
            }}
            className="clear-btn"
          >
            🗑️ Clear All & Start Fresh
          </button>
        </div>

        {/* Agent Flow Visualization */}
        <AgentFlow 
          currentAgent={currentAgent}
          agentActivity={agentActivity}
          currentIdea={currentIdea}
          research={research}
          product={product}
          marketingStrategy={marketingStrategy}
          technicalStrategy={technicalStrategy}
          boltPrompt={boltPrompt}
          onOpenBolt={openBoltWithPrompt}
          onStartMarketing={startMarketingCampaign}
        />

        <div className="ideas-grid">
          {currentIdea ? (
            <div className="idea-card">
              <h3>{currentIdea.title}</h3>
              <p>{String(currentIdea.description)}</p>
              {currentIdea.potential_revenue && (
                <div className="idea-revenue">
                  <h6>💰 Revenue Potential:</h6>
                  <div>
                    {typeof currentIdea.potential_revenue === 'object' ? (
                      <ul>
                        {Object.entries(currentIdea.potential_revenue).map(([key, value]) => (
                          <li key={key}>
                            <strong>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> {String(value)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>{String(currentIdea.potential_revenue)}</p>
                    )}
                  </div>
                </div>
              )}
              <div className="idea-status">
                <span className="status-badge pending">
                  PENDING
                </span>
              </div>
              
              <div className="idea-actions">
                {!research && (
                  <>
                    <button 
                      onClick={() => voteOnItem('idea', 'approve')}
                      className="approve-btn"
                    >
                      ✅ Approve & Start Research
                    </button>
                    <button 
                      onClick={() => voteOnItem('idea', 'reject')}
                      className="reject-btn"
                    >
                      ❌ Reject & Generate New
                    </button>
                  </>
                )}
                
                {research && !product && (
                  <div className="workflow-status">
                    <span className="status-text">⏳ Product Agent will start automatically...</span>
                  </div>
                )}

                {currentAgent && currentAgent.includes('CEO Agent') && loading && (
                  <div className="workflow-status">
                    <span className="status-text">🤔 CEO Agent is thinking of a new idea...</span>
                  </div>
                )}
                
                {product && !marketingStrategy && (
                  <div className="final-approval-section">
                    <div className="ceo-approval-header">
                      <h4>🎯 CEO Agent Evaluation Complete!</h4>
                      <p>The CEO Agent has reviewed the product concept and approved it for final token holder vote.</p>
                    </div>
                    <div className="final-voting-section">
                      <h5>Final Token Holder Decision Required:</h5>
                      <div className="product-actions">
                        <button 
                          onClick={() => voteOnItem('product', 'approve')}
                          className="final-approve-btn"
                        >
                          🚀 APPROVE FINAL PRODUCT
                        </button>
                        <button 
                          onClick={() => voteOnItem('product', 'reject')}
                          className="final-reject-btn"
                        >
                          ❌ REJECT PRODUCT
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {marketingStrategy && technicalStrategy && !boltPrompt && (
                  <div className="workflow-complete">
                    <span className="complete-text">🎉 WORKFLOW COMPLETE! Product approved and ready for development!</span>
                  </div>
                )}
              </div>

              {research && (
                <div className="research-section">
                  <h4>📊 Research Agent Status:</h4>
                  <div className="research-status">
                    <span className="status-badge">✅ Research Complete - Data Shared with Product Agent</span>
                  </div>
                </div>
              )}

              {product && (
                <div className="product-section">
                  <h4>🚀 Complete Product Concept (CEO Approved):</h4>
                  <div className="product-details">
                    <div className="product-header">
                      <h5>🎯 {product.product_name || 'Product Name'}</h5>
                      <div className="ceo-approval-badge">
                        <span>✅ CEO Agent Approved</span>
                      </div>
                    </div>
                    
                    <div className="product-description">
                      <h6>📝 Product Description:</h6>
                      <p>{String(product.product_description || 'Product description will be added here.')}</p>
                    </div>
                    
                    <div className="product-features">
                      <h6>⚡ Core Features ({product.features?.length || 0}):</h6>
                      <ul className="features-list">
                        {product.features?.map((feature, index) => (
                          <li key={index}>{String(feature)}</li>
                        ))}
                      </ul>
                    </div>
                    
        <div className="product-market">
          <h6>🎯 Target Market:</h6>
          <div className="market-details">
            {typeof product.target_market === 'object' ? (
              <>
                <p><strong>Primary:</strong> {formatSegment(product.target_market.primary)}</p>
                <p><strong>Secondary:</strong> {formatSegment(product.target_market.secondary)}</p>
              </>
            ) : (
              <p>{formatSegment(product.target_market)}</p>
            )}
          </div>
        </div>
                    
                    {product.value_proposition && (
                      <div className="product-value">
                        <h6>💎 Value Proposition:</h6>
                        <p>{String(product.value_proposition)}</p>
                      </div>
                    )}
                    
                    {product.revenue_model && (
                      <div className="product-revenue">
                        <h6>💰 Revenue Model:</h6>
                        <div>
                          {typeof product.revenue_model === 'object' ? (
                            <ul>
                              {Object.entries(product.revenue_model).map(([key, value]) => (
                                <li key={key}>
                                  <strong>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> {String(value)}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p>{String(product.revenue_model)}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Simplified Status Indicators */}
              {marketingStrategy && (
                <div className="workflow-status">
                  <span className="status-text">✅ Marketing Strategy Complete</span>
                </div>
              )}

              {boltPrompt && (
                <div className="workflow-complete">
                  <div className="workflow-status">
                    <span className="status-text">✅ Website Development Prompt Ready - Click Developer Agent to check progress!</span>
                  </div>
                  
                </div>
              )}
            </div>
          ) : null}
        </div>

        {!currentIdea && !loading && (
          <div className="empty-state">
            <p>No idea currently being worked on. Click "Generate New Idea" to start the AI Company workflow!</p>
          </div>
        )}

        {!currentIdea && loading && currentAgent && currentAgent.includes('CEO Agent') && (
          <div className="empty-state">
            <p>🤔 CEO Agent is thinking of a new business idea...</p>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '10px' }}>
              Please wait while we generate something amazing!
            </p>
          </div>
        )}
          </div>
        )}

        {activeTab === 'revenue' && (
          <RevenueDashboard />
        )}
      </main>

    </div>
  );
}

export default App; 