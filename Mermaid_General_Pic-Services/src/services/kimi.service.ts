import axios from 'axios';
import { config } from '../config/config';
import { logWithContext } from '../utils/logger';

export class KimiService {
  private static readonly KIMI_API_URL = 'https://api.moonshot.cn/v1';
  private static readonly MODEL = 'moonshot-v1-8k';
  private static readonly SYSTEM_PROMPT = `你是一个专业的图表设计师，擅长使用Mermaid语法创建各种图表。
当用户描述他们想要的图表时，你需要：
1. 理解用户的需求
2. 使用Mermaid语法生成对应的代码
3. 只返回Mermaid代码，不要包含其他解释或说明
4. 确保生成的代码是有效的Mermaid语法
5. 不要在代码中包含 \`\`\`mermaid 标记

示例输出格式：
graph TD
    A[开始] --> B[处理]
    B --> C[结束]`;

  private static cleanMermaidCode(code: string): string {
    // 移除代码块标记
    code = code.replace(/\`\`\`mermaid\n/g, '');
    code = code.replace(/\`\`\`/g, '');
    
    // 移除可能的前导和尾随空白
    code = code.trim();

    // 确保代码以图表类型开始
    if (!code.startsWith('graph') && !code.startsWith('sequenceDiagram') && 
        !code.startsWith('classDiagram') && !code.startsWith('stateDiagram') &&
        !code.startsWith('erDiagram') && !code.startsWith('flowchart')) {
      code = 'graph TD\n' + code;
    }

    logWithContext('debug', 'Cleaned Mermaid code', {
      originalCode: code,
      cleanedCode: code
    });

    return code;
  }

  static async generateMermaidCode(prompt: string): Promise<string> {
    try {

      if (!config.kimiApiKey) {
        throw new Error('Kimi API key is not configured');
      }

      logWithContext('info', 'Sending request to Kimi API', {
        prompt,
        apiUrl: this.KIMI_API_URL,
        model: this.MODEL,
        systemPrompt: this.SYSTEM_PROMPT
      });

      const response = await axios.post(
        `${this.KIMI_API_URL}/chat/completions`,
        {
          model: this.MODEL,
          messages: [
            {
              role: 'system',
              content: this.SYSTEM_PROMPT
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${config.kimiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // 记录完整的 API 响应
      logWithContext('debug', 'Received response from Kimi API', {
        prompt,
        fullResponse: response.data,
        status: response.status,
        headers: response.headers
      });

      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response from Kimi API');
      }

      const rawCode = response.data.choices[0].message.content.trim();
      const mermaidCode = this.cleanMermaidCode(rawCode);
      
      logWithContext('info', 'Generated Mermaid code from Kimi', {
        prompt,
        rawCode,
        cleanedCode: mermaidCode,
        codeLength: mermaidCode.length,
        usage: response.data.usage,
        model: response.data.model,
        responseId: response.data.id
      });

      return mermaidCode;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.message || 'Unknown error';
      logWithContext('error', 'Failed to generate Mermaid code from Kimi', {
        prompt,
        error: errorMessage,
        response: error?.response?.data,
        status: error?.response?.status,
        headers: error?.response?.headers,
        stack: error?.stack,
        config: error?.config
      });
      throw new Error(`Failed to generate diagram code: ${errorMessage}`);
    }
  }
} 