/**
 * Claude Project Integration Service
 * Creates fresh Claude chats within the Zero Barriers Growth Accelerator project
 * Each client gets a unique session with stored assessment rules
 */

export interface ClaudeProjectConfig {
  projectId: string;
  projectUrl: string;
  apiKey: string;
  baseUrl: string;
}

export interface ClientSession {
  clientId: string;
  websiteUrl: string;
  domain: string;
  sessionId: string;
  createdAt: string;
  assessmentRules: string[];
  status: 'active' | 'completed' | 'failed';
}

export interface AssessmentResult {
  clientId: string;
  assessmentType: string;
  success: boolean;
  analysis: any;
  timestamp: string;
  claudeChatUrl?: string;
  error?: string;
}

export class ClaudeProjectIntegrationService {
  private static config: ClaudeProjectConfig = {
    projectId: '0199eeed-2813-7556-982f-f4773a045d86',
    projectUrl: 'https://claude.ai/project/0199eeed-2813-7556-982f-f4773a045d86',
    apiKey: process.env.CLAUDE_API_KEY || '',
    baseUrl: 'https://api.anthropic.com/v1'
  };

  /**
   * Create a fresh Claude chat session for a client
   */
  static async createClientSession(websiteUrl: string): Promise<ClientSession> {
    const domain = new URL(websiteUrl).hostname;
    const clientId = this.generateClientId(domain);
    const sessionId = `${clientId}_${Date.now()}`;

    console.log(`🤖 Creating Claude session for client: ${clientId}`);

    try {
      // Initialize Claude chat with project context
      const claudeResponse = await this.initializeClaudeChat(sessionId, websiteUrl);

      const session: ClientSession = {
        clientId,
        websiteUrl,
        domain,
        sessionId,
        createdAt: new Date().toISOString(),
        assessmentRules: [],
        status: 'active'
      };

      console.log(`✅ Claude session created: ${sessionId}`);
      return session;
    } catch (error) {
      console.error(`❌ Failed to create Claude session:`, error);
      throw new Error(`Failed to create Claude session: ${error}`);
    }
  }

  /**
   * Run assessment using Claude project
   */
  static async runAssessment(
    session: ClientSession,
    assessmentType: string,
    scrapedData: any
  ): Promise<AssessmentResult> {
    console.log(`🎯 Running ${assessmentType} assessment for client: ${session.clientId}`);

    try {
      // Load assessment rules
      const rules = await this.loadAssessmentRules(assessmentType);

      // Build prompt for Claude
      const prompt = this.buildClaudePrompt(rules, scrapedData, session.websiteUrl);

      // Send to Claude project
      const claudeResponse = await this.sendToClaudeProject(session, prompt, assessmentType);

      // Parse and validate response
      const analysis = this.parseClaudeResponse(claudeResponse, assessmentType);

      const result: AssessmentResult = {
        clientId: session.clientId,
        assessmentType,
        success: true,
        analysis,
        timestamp: new Date().toISOString(),
        claudeChatUrl: this.generateChatUrl(session.sessionId)
      };

      console.log(`✅ Assessment completed for ${session.clientId}: ${assessmentType}`);
      return result;
    } catch (error) {
      console.error(`❌ Assessment failed for ${session.clientId}:`, error);

      return {
        clientId: session.clientId,
        assessmentType,
        success: false,
        analysis: null,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Assessment failed'
      };
    }
  }

  /**
   * Generate unique client ID from domain
   */
  private static generateClientId(domain: string): string {
    const cleanDomain = domain.replace(/\.(com|org|net|co|io)$/, '');
    const hash = cleanDomain.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return `client_${Math.abs(hash).toString(36)}`;
  }

  /**
   * Initialize Claude chat with project context
   */
  private static async initializeClaudeChat(sessionId: string, websiteUrl: string): Promise<any> {
    const initPrompt = `You are working within the Zero Barriers Growth Accelerator project.

PROJECT CONTEXT:
- This is a business analysis platform that helps organizations identify revenue opportunities
- We analyze websites using proven frameworks (Golden Circle, Elements of Value, CliftonStrengths, etc.)
- Each client gets a fresh analysis session focused on their specific business needs

CLIENT SESSION:
- Session ID: ${sessionId}
- Website URL: ${websiteUrl}
- Analysis Focus: Revenue opportunities, competitive advantage, growth potential

Please confirm you understand the project context and are ready to perform business analysis for this client.`;

    // In a real implementation, this would call Claude API
    // For now, return a mock response
    return {
      success: true,
      sessionId,
      message: 'Claude session initialized successfully'
    };
  }

  /**
   * Load assessment rules from project files
   */
  private static async loadAssessmentRules(assessmentType: string): Promise<any> {
    try {
      const rules = await import(`./assessment-rules/${assessmentType}-rules.json`);
      return rules.default;
    } catch (error) {
      throw new Error(`Failed to load assessment rules for ${assessmentType}: ${error}`);
    }
  }

  /**
   * Build Claude-specific prompt
   */
  private static buildClaudePrompt(rules: any, scrapedData: any, websiteUrl: string): string {
    const context = rules.context_template
      .replace('{url}', websiteUrl)
      .replace('{title}', scrapedData.title || '')
      .replace('{metaDescription}', scrapedData.metaDescription || '')
      .replace('{content}', scrapedData.cleanText?.substring(0, 4000) || '')
      .replace('{headings}', JSON.stringify(scrapedData.headings || []))
      .replace('{proposedContent}', scrapedData.proposedContent || '')
      .replace('{keywords}', scrapedData.keywords || '')
      .replace('{trendsData}', JSON.stringify(scrapedData.trends || {}))
      .replace('{pageSpeedData}', JSON.stringify(scrapedData.pageSpeed || {}))
      .replace('{searchConsoleData}', JSON.stringify(scrapedData.searchConsole || {}))
      .replace('{analyticsData}', JSON.stringify(scrapedData.analytics || {}));

    return `PROJECT: Zero Barriers Growth Accelerator
ASSESSMENT: ${rules.assessment_name}
VERSION: ${rules.version}

${rules.persona}

${rules.task}

${context}

${rules.format}

Please provide a comprehensive analysis following the exact JSON format specified above.`;
  }

  /**
   * Send prompt to Claude project
   */
  private static async sendToClaudeProject(
    session: ClientSession,
    prompt: string,
    assessmentType: string
  ): Promise<any> {
    // In a real implementation, this would:
    // 1. Create a new chat in the Claude project
    // 2. Send the prompt to that chat
    // 3. Wait for and return the response

    console.log(`📤 Sending ${assessmentType} prompt to Claude project for ${session.clientId}`);

    // Mock response for now
    return {
      success: true,
      response: 'Mock Claude response - would contain actual analysis',
      chatId: `chat_${session.sessionId}`,
      projectUrl: this.config.projectUrl
    };
  }

  /**
   * Parse Claude response and validate structure
   */
  private static parseClaudeResponse(response: any, assessmentType: string): any {
    try {
      // In a real implementation, this would parse the actual Claude response
      // For now, return a mock analysis structure
      return {
        assessment_type: assessmentType,
        timestamp: new Date().toISOString(),
        status: 'completed',
        data: {
          mock: true,
          message: 'This would contain the actual Claude analysis results'
        }
      };
    } catch (error) {
      throw new Error(`Failed to parse Claude response: ${error}`);
    }
  }

  /**
   * Generate Claude chat URL for client session
   */
  private static generateChatUrl(sessionId: string): string {
    return `${this.config.projectUrl}/chat/${sessionId}`;
  }

  /**
   * Get all active client sessions
   */
  static async getActiveSessions(): Promise<ClientSession[]> {
    // In a real implementation, this would query a database
    // For now, return empty array
    return [];
  }

  /**
   * Get client session by ID
   */
  static async getClientSession(clientId: string): Promise<ClientSession | null> {
    // In a real implementation, this would query a database
    // For now, return null
    return null;
  }

  /**
   * Close client session
   */
  static async closeClientSession(sessionId: string): Promise<boolean> {
    console.log(`🔒 Closing Claude session: ${sessionId}`);
    // In a real implementation, this would close the Claude chat
    return true;
  }
}
