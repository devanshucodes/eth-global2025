const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

// Database connection
const dbPath = process.env.DB_PATH || './database/ai_company.db';
const db = new sqlite3.Database(dbPath);

// Get all CEO agents
router.get('/', (req, res) => {
  const query = `
    SELECT id, name, company_idea, description, ceo_characteristics, 
           creator_wallet, token_symbol, total_tokens, tokens_available, 
           price_per_token, status, created_at, updated_at, launch_timeline, launch_date, time_duration
    FROM ceo_agents 
    ORDER BY created_at DESC
  `;
  
  db.all(query, (err, agents) => {
    if (err) {
      console.error('Get CEO agents error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, data: agents });
  });
});

// Get single CEO agent
router.get('/:id', (req, res) => {
  const agentId = req.params.id;
  
  db.get('SELECT * FROM ceo_agents WHERE id = ?', [agentId], (err, agent) => {
    if (err) {
      console.error('Get CEO agent error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    
    if (!agent) {
      return res.status(404).json({ success: false, error: 'CEO Agent not found' });
    }
    
    res.json({ success: true, agent });
  });
});

// Create new CEO agent
router.post('/', (req, res) => {
  const {
    name,
    company_idea,
    description,
    ceo_characteristics,
    creator_wallet,
    token_symbol,
    total_tokens = 100,
    price_per_token = 5.0,
    launch_timeline = 10,
    time_duration
  } = req.body;
  
  // Use launch_timeline for time_duration if not provided
  const agentTimeDuration = time_duration || launch_timeline;

  // Validate required fields
  if (!name || !company_idea || !description || !ceo_characteristics || !token_symbol) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: name, company_idea, description, ceo_characteristics, token_symbol'
    });
  }

  // Calculate launch date (in minutes for demo)
  const launch_date = new Date();
  launch_date.setMinutes(launch_date.getMinutes() + launch_timeline);
  const launch_date_string = launch_date.toISOString();

  const query = `
    INSERT INTO ceo_agents (
      name, company_idea, description, ceo_characteristics, 
      creator_wallet, token_symbol, total_tokens, tokens_available, price_per_token,
      launch_timeline, launch_date, time_duration
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const tokens_available = total_tokens; // All tokens available initially

  db.run(query, [
    name, company_idea, description, ceo_characteristics,
    creator_wallet, token_symbol, total_tokens, tokens_available, price_per_token,
    launch_timeline, launch_date_string, agentTimeDuration
  ], function(err) {
    if (err) {
      console.error('Create CEO agent error:', err);
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({
          success: false,
          error: 'Token symbol already exists. Please choose a different symbol.'
        });
      }
      return res.status(500).json({ success: false, error: err.message });
    }

    // Return the created agent
    db.get('SELECT * FROM ceo_agents WHERE id = ?', [this.lastID], (err, agent) => {
      if (err) {
        console.error('Get created agent error:', err);
        return res.status(500).json({ success: false, error: err.message });
      }
      
      res.status(201).json({
        success: true,
        message: 'CEO Agent created successfully!',
        agent
      });
    });
  });
});

// Buy tokens in a CEO agent
router.post('/:id/buy-tokens', (req, res) => {
  const agentId = req.params.id;
  const { user_wallet, tokens_to_buy } = req.body;

  if (!user_wallet || !tokens_to_buy || tokens_to_buy <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request. Need user_wallet and positive tokens_to_buy.'
    });
  }

  // Start transaction
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Check if enough tokens available
    db.get('SELECT * FROM ceo_agents WHERE id = ?', [agentId], (err, agent) => {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ success: false, error: err.message });
      }

      if (!agent) {
        db.run('ROLLBACK');
        return res.status(404).json({ success: false, error: 'CEO Agent not found' });
      }

      if (agent.tokens_available < tokens_to_buy) {
        db.run('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: `Not enough tokens available. Only ${agent.tokens_available} tokens left.`
        });
      }

      // Update agent tokens_available
      db.run(
        'UPDATE ceo_agents SET tokens_available = tokens_available - ? WHERE id = ?',
        [tokens_to_buy, agentId],
        (err) => {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ success: false, error: err.message });
          }

          // Record the token purchase
          db.run(
            `INSERT INTO agent_token_holdings (user_wallet, ceo_agent_id, tokens_owned, purchase_price)
             VALUES (?, ?, ?, ?)`,
            [user_wallet, agentId, tokens_to_buy, agent.price_per_token],
            (err) => {
              if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ success: false, error: err.message });
              }

              db.run('COMMIT');
              res.json({
                success: true,
                message: `Successfully purchased ${tokens_to_buy} ${agent.token_symbol} tokens!`,
                purchase: {
                  tokens_bought: tokens_to_buy,
                  price_per_token: agent.price_per_token,
                  total_cost: tokens_to_buy * agent.price_per_token,
                  agent_name: agent.name
                }
              });
            }
          );
        }
      );
    });
  });
});

// Launch CEO agent (move to companies table)
router.post('/:id/launch', (req, res) => {
  const agentId = req.params.id;
  
  // First, check if agent already has a company (prevent duplicates)
  db.get('SELECT * FROM companies WHERE ceo_agent_id = ?', [agentId], (err, existingCompany) => {
    if (err) {
      console.error('Check existing company error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    
    if (existingCompany) {
      console.log(`Agent ${agentId} already has company ${existingCompany.id}, skipping launch`);
      return res.json({
        success: true,
        message: 'Agent already launched!',
        company: existingCompany
      });
    }
    
    // Also check if agent still exists (might have been deleted already)
    db.get('SELECT * FROM ceo_agents WHERE id = ?', [agentId], (err, agent) => {
      if (err) {
        console.error('Get agent error:', err);
        return res.status(500).json({ success: false, error: err.message });
      }
      
      if (!agent) {
        console.log(`Agent ${agentId} not found, might already be launched`);
        return res.json({
          success: true,
          message: 'Agent already launched!'
        });
      }
      
      // Create company entry with CEO agent details
      const companyQuery = `
        INSERT INTO companies (
          ceo_agent_id, name, status, current_revenue, launched_date,
          ceo_agent_name, token_symbol, company_idea, description, ceo_characteristics,
          total_tokens, price_per_token, time_duration
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const companyName = `${agent.name} Company`;
      const launchedDate = new Date().toISOString();
      
      db.run(companyQuery, [
        agentId, companyName, 'running', 0, launchedDate,
        agent.name, agent.token_symbol, agent.company_idea, agent.description, agent.ceo_characteristics,
        agent.total_tokens, agent.price_per_token, agent.time_duration || agent.launch_timeline
      ], function(err) {
        if (err) {
          console.error('Create company error:', err);
          return res.status(500).json({ success: false, error: err.message });
        }
        
        // Delete the agent from ceo_agents table (move to companies only)
        db.run(
          'DELETE FROM ceo_agents WHERE id = ?',
          [agentId],
          (err) => {
            if (err) {
              console.error('Delete agent error:', err);
              return res.status(500).json({ success: false, error: err.message });
            }
            
            res.json({
              success: true,
              message: 'Agent launched successfully!',
              company: {
                id: this.lastID,
                name: companyName,
                ceo_agent_id: agentId,
                status: 'running',
                launched_date: launchedDate
              }
            });
          }
        );
      });
    });
  });
});

module.exports = router;
