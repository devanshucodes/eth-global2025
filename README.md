# 🤖 AI Company - Fully Automated Organization

A revolutionary AI-only company with hierarchical AI agents and token holder governance.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- ASI:One API key from ASI Alliance

### Installation

1. **Clone and setup:**
```bash
cd team-zero
npm install
cd client && npm install && cd ..
```

2. **Configure environment:**
```bash
cp env.example .env
# Edit .env and add your ASI:One API key
```

3. **Initialize database:**
```bash
node database/setup.js
```

4. **Start the system:**
```bash
# Terminal 1 - Backend
npm start

# Terminal 2 - Frontend
npm run client
```

5. **Access the dashboard:**
- Open http://localhost:3000
- You'll see the Token Holder Dashboard

## 🎯 How It Works

### Current Workflow
1. **Generate Ideas**: CEO Agent creates $1M business ideas
2. **Token Holder Vote**: Approve/reject ideas via dashboard
3. **Research Phase**: Research Agent analyzes approved ideas
4. **Product Development**: Product Agent creates detailed concepts
5. **CEO Validation**: CEO Agent evaluates product concept for market viability
6. **Token Holder Vote**: Approve/reject product concepts via dashboard
7. **Marketing Strategy**: CMO Agent develops marketing plans
8. **Technical Strategy**: CTO Agent creates technical architecture
9. **Marketing Agent**: Receives strategy from CMO and executes campaigns
10. **Head of Engineering**: Receives technical strategy from CTO and creates Bolt prompts
11. **Developer Agent**: Receives prompts and opens Bolt.diy for website development

## 🔧 Recent Updates & Fixes

### Time Duration Feature (December 2024)
- ✅ **Agent Operation Duration**: Added time selection option (5, 10, 15 minutes) to create agent form
- ✅ **Database Schema**: Added `time_duration` column to `ceo_agents` table
- ✅ **Backend Integration**: Updated CEO agent creation endpoint to handle time duration parameter
- ✅ **Frontend UI**: Added time duration dropdown in the Launch Timeline section
- ✅ **Migration**: Created database migration to add time_duration column to existing records

### Phase 2: Revenue Integration (September 2025)
- ✅ **Smart Contract Integration**: Connected Avalanche AVAX Dividend Distributor contract
- ✅ **Automated Revenue Distribution**: 80% to company, 20% to token holders on project completion
- ✅ **Finance Agent**: New AI agent that handles revenue analysis and distribution
- ✅ **Revenue Dashboard**: Real-time tracking of dividends, distributions, and token holders
- ✅ **Web3 Service**: Complete blockchain integration with ethers.js
- ✅ **Database Schema**: Revenue tracking, token holders, and project completions
- ✅ **API Endpoints**: Full finance management REST API
- ✅ **Frontend Integration**: Tabbed interface with Agent Dashboard and Revenue Dashboard

### Agent Flow Fixes (September 2025)
- ✅ **Fixed 404 Error**: Resolved server endpoint issues causing agent communication failures
- ✅ **Complete Agent Flow**: Fixed workflow to properly trigger all agents in sequence:
  - Research Agent → Product Agent → CMO Agent → CTO Agent → Head of Engineering
- ✅ **Backend Stability**: Fixed CMO and CTO agents to handle missing research data gracefully
- ✅ **Frontend Integration**: Updated frontend to properly trigger subsequent agents after each step

### What Was Fixed
1. **Server Restart Required**: The main issue was a server process that needed restarting
2. **Agent Flow Logic**: Updated `developProduct()` function to call `triggerCMOAndCTO()` instead of stopping
3. **Error Handling**: Fixed agents to handle empty research data without crashing
4. **Route Parameters**: Corrected agent method calls to pass proper parameters
5. **React State Timing Issue**: Fixed critical issue where agents weren't triggering due to React state update timing - now passes data directly between functions

### Current Status
- ✅ All agent endpoints working correctly
- ✅ Complete workflow from idea generation to bolt prompt creation
- ✅ Proper error handling and fallback data
- ✅ Real-time agent activity tracking in UI

### Agent Hierarchy
```
CEO Agent (Idea Generation & Product Validation)
├── Research Agent (Market Analysis)
├── Product Agent (Product Development)
├── CMO Agent (Marketing Strategy)
│   └── Marketing Agent (Campaign Execution)
├── CTO Agent (Technical Strategy)
│   └── Head of Engineering Agent (Bolt Prompt Creation)
│       └── Developer Agent (Bolt.diy Integration)
└── Finance Agent (Revenue Distribution & Analysis)
    └── Smart Contract (Automated Profit Sharing)
```

## 🛠️ Features

### ✅ Implemented
- **CEO Agent**: Generates business ideas using ASI:One API
- **Research Agent**: Market research and competitive analysis
- **Product Agent**: Product concept development
- **Finance Agent**: Revenue analysis and automated distribution
- **Token Holder Dashboard**: Voting and approval interface with revenue tracking
- **Revenue Dashboard**: Real-time dividend tracking and smart contract monitoring
- **Smart Contract Integration**: Avalanche AVAX Dividend Distributor
- **Web3 Service**: Blockchain interaction with automated profit sharing
- **Database**: SQLite storage for all data including revenue tracking
- **API Server**: RESTful API for agent communication and finance management

### 🚧 Coming Soon
- **Coding Agents**: Website development with Bolt integration
- **Marketing Agent**: Social media automation via n8n
- **Real-time Updates**: Live agent activity feed
- **Advanced UI**: Better user experience

## 📁 Project Structure

```
team-zero/
├── agents/                 # AI Agent implementations
│   ├── ASIOneAgent.js     # Base agent class
│   ├── CEOAgent.js        # CEO agent
│   ├── ResearchAgent.js   # Research agent
│   └── ProductAgent.js    # Product agent
├── routes/                # API routes
│   ├── agents.js          # Agent endpoints
│   ├── ideas.js           # Idea management
│   └── tokens.js          # Voting system
├── database/              # Database setup
│   └── setup.js           # SQLite initialization
├── client/                # React frontend
│   ├── src/
│   │   ├── App.js         # Main dashboard
│   │   └── App.css        # Styling
│   └── package.json
├── server.js              # Express server
├── package.json           # Backend dependencies
└── README.md              # This file
```

## 🔧 API Endpoints

### Agents
- `POST /api/agents/generate-ideas` - Generate new business ideas
- `POST /api/agents/research/:ideaId` - Research an idea
- `POST /api/agents/develop-product/:ideaId` - Develop product concept
- `GET /api/agents/activities` - Get agent activity log

### Ideas
- `GET /api/ideas` - Get all ideas
- `GET /api/ideas/:id` - Get specific idea with research/product
- `PUT /api/ideas/:id/status` - Update idea status

### Tokens
- `POST /api/tokens/vote` - Vote on ideas/products
- `GET /api/tokens/votes/:itemType/:itemId` - Get votes for item
- `GET /api/tokens/summary/:itemType/:itemId` - Get voting summary

### Finance
- `POST /api/finance/distribute-revenue` - Distribute revenue for completed project
- `POST /api/finance/analyze-revenue/:ideaId` - Analyze revenue projection
- `GET /api/finance/report` - Generate financial report
- `GET /api/finance/contract-info` - Get smart contract information
- `GET /api/finance/revenue-history` - Get revenue distribution history
- `GET /api/finance/token-holders` - Get token holder information
- `POST /api/finance/token-holders` - Add new token holder
- `GET /api/finance/dividend-info/:address` - Get dividend info for address
- `POST /api/finance/complete-project` - Mark project as complete and distribute revenue

## 🎮 Usage

1. **Start the system** (see Quick Start above)
2. **Generate idea**: Click "Generate New Idea" button (generates ONE idea)
3. **Approve idea**: Click "Approve & Start Research" to begin workflow
4. **Watch agents work**: See real-time agent activity in the dashboard
5. **Automatic workflow**: 
   - CEO generates idea → Token holder approves → Research Agent researches
   - Research completes → Product Agent develops concept → Token holder approves
   - Marketing & Technical strategies → Website development prompt created
   - **Revenue Distribution**: Finance Agent automatically distributes profits when projects complete
6. **Monitor progress**: All agent activities are displayed in real-time
7. **Track revenue**: Switch to Revenue Dashboard to see dividend distributions and token holder rewards

## 💰 Revenue Integration

### How Automated Profit Sharing Works

1. **Project Completion**: When AI agents complete projects (websites, marketing campaigns, etc.)
2. **Revenue Calculation**: Finance Agent calculates estimated revenue based on project complexity
3. **Smart Contract Distribution**: 
   - 80% goes to company wallet (operational costs, development)
   - 20% distributed proportionally to all token holders as dividends
4. **Blockchain Recording**: All transactions recorded on Avalanche blockchain
5. **Real-time Tracking**: Revenue Dashboard shows live dividend balances and distribution history

### Revenue Sources
- **Website Deployments**: 0.1 AVAX base + complexity bonuses
- **Marketing Campaigns**: 0.05 AVAX base + channel bonuses  
- **Product Launches**: 0.2 AVAX base + feature bonuses
- **Custom Projects**: Variable based on scope and value

### Token Holder Benefits
- **Automatic Dividends**: Receive AVAX proportional to token holdings
- **No Manual Claims**: Pull-based system - claim dividends when ready
- **Transparent Tracking**: View all distributions on blockchain explorer
- **Governance Rights**: Vote on AI agent decisions and company direction

## 🔑 Environment Variables

```bash
# Required
ASI_ONE_API_KEY=your_asi_one_api_key_here

# Web3 Configuration (Required for Revenue Distribution)
PRIVATE_KEY=your_avalanche_wallet_private_key_here
CONTRACT_ADDRESS=0x0471AaD869eBa890d63A2f276828879A9a375858
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc

# Optional
PORT=5000
NODE_ENV=development
DB_PATH=./database/ai_company.db
N8N_WEBHOOK_URL=your_n8n_webhook_url_here
```

## 🐛 Troubleshooting

### Common Issues

1. **ASI:One API Error**: Make sure your API key is correct and has credits
2. **Database Error**: Run `node database/setup.js` to initialize
3. **Port Conflicts**: Change PORT in .env file
4. **CORS Issues**: Make sure backend is running on port 5000

### Debug Mode
```bash
NODE_ENV=development npm start
```

## 🚀 Next Development Steps

1. **Add Coding Agents**: Frontend/Backend agents for website development
2. **Bolt Integration**: Connect agents to website building platform
3. **Marketing Agent**: Social media automation
4. **Real-time Updates**: WebSocket integration for live updates
5. **Advanced UI**: Better dashboard with real-time agent activity

## 🎨 UI Redesign (Latest Update)

### Design Philosophy
- **Minimalist Aesthetic**: Clean, professional interface inspired by modern design systems
- **Terminal Theme**: Agent activity section uses black/red color scheme for autonomous/degen vibe
- **Neutral Color Palette**: Replaced colorful gradients with sophisticated grays, whites, and blacks
- **Typography**: Clean, readable fonts with proper hierarchy and spacing

### Key Changes
1. **Background**: Changed from colorful gradient to clean white/light gray (`#f8f9fa`)
2. **Cards**: White backgrounds with subtle borders instead of translucent glass effects
3. **Buttons**: Minimalist design with neutral colors and subtle hover effects
4. **Agent Activity**: Terminal-style section with black background and red accent colors
5. **Typography**: Improved font weights, sizes, and spacing for better readability
6. **Color Scheme**: Consistent use of grays (#374151, #4a5568, #6b7280) and blacks (#000000, #1a202c)

### Technical Implementation
- Updated `client/src/App.css` with complete redesign
- Maintained all functionality while improving visual hierarchy
- Added terminal-style monospace fonts for agent activity
- Improved responsive design and accessibility

## 🛠️ Bolt.diy Integration & Customization

### Recent Customizations
- **Streamlined AI Models**: Removed all AI providers except Anthropic for focused development experience
- **ASI:One Integration**: Updated to use ASI:One Mini (asi1-mini) with Web3-native agentic AI capabilities
- **Simplified Provider UI**: Updated settings interface to only show Anthropic with clear model description
- **Enhanced Performance**: Disabled dynamic model loading to ensure consistent ASI:One Mini usage
- **Cleaned UI Interface**: Removed Import Chat, Import Folder, and Clone a repo buttons for streamlined developer agent experience
- **Updated Welcome Text**: Changed main heading to "Developer Agent" and description to focus on development assistance
- **Custom Branding**: Replaced Bolt.diy logo with "team zero" in stylized gradient design
- **Removed Sidebar**: Eliminated left sidebar with chat history, user info, and navigation for cleaner, focused interface
- **Agent-Only Interface**: Removed input box and export functionality - designed for programmatic AI agent interaction only
- **Simplified Toolbar**: Removed Sync button, replaced Toggle Terminal with Deploy button for streamlined workflow
- **Terminal Hacker UI**: Enhanced Recent Activity section with green terminal styling, scanline effects, and indie hacker vibe

### Modified Files
- `bolt.diy-main/app/lib/modules/llm/registry.ts` - Removed all providers except Anthropic
- `bolt.diy-main/app/lib/modules/llm/providers/anthropic.ts` - Updated to ASI:One Mini only
- `bolt.diy-main/app/components/@settings/tabs/providers/cloud/CloudProvidersTab.tsx` - Simplified UI
- `bolt.diy-main/app/components/chat/BaseChat.tsx` - Updated welcome text and removed import buttons
- `bolt.diy-main/app/components/header/Header.tsx` - Replaced logo with "team zero" branding

### Developer Agent Integration
When the Head of Engineering creates a development prompt, the Developer Agent becomes clickable and opens Bolt.diy with the generated prompt, now powered exclusively by ASI:One Mini for consistent, high-quality code generation.

## 📝 Development Notes

- All agent communication uses ASI:One API
- Database is SQLite for simplicity
- Frontend is React with minimalist, professional styling
- API uses Express.js with CORS enabled
- Token holder system is basic voting mechanism
- UI follows modern design principles with terminal-inspired agent activity section
- Bolt.diy integration uses ASI:One Mini for website development

## 🤝 Contributing

This is a proof-of-concept implementation. Future improvements:
- Better error handling
- Agent coordination improvements
- Real-time updates
- Advanced UI/UX
- Production deployment

---

**Status**: Basic working version with CEO, Research, and Product agents
**Next**: Add coding and marketing agents with Bolt/n8n integration
