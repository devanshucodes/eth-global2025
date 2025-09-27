import { BaseProvider } from '~/lib/modules/llm/base-provider';
import type { ModelInfo } from '~/lib/modules/llm/types';
import type { LanguageModelV1 } from 'ai';
import type { IProviderSetting } from '~/types/model';
import { createAnthropic } from '@ai-sdk/anthropic';

export default class AnthropicProvider extends BaseProvider {
  name = 'ASI:One';
  getApiKeyLink = 'https://docs.asi1.ai/docs/';

  config = {
    apiTokenKey: 'ASI_ONE_API_KEY',
  };

  staticModels: ModelInfo[] = [
    /*
     * ASI:One Mini: Web3-native LLM for agentic AI
     * This is the only model available in this customized version
     */
    {
      name: 'asi1-mini',
      label: 'ASI:One Mini',
      provider: 'ASI:One',
      maxTokenAllowed: 200000,
      maxCompletionTokens: 128000,
    },
  ];

  async getDynamicModels(
    apiKeys?: Record<string, string>,
    settings?: IProviderSetting,
    serverEnv?: Record<string, string>,
  ): Promise<ModelInfo[]> {
    // Return empty array to only use static models (ASI:One Mini only)
    return [];
  }

  getModelInstance: (options: {
    model: string;
    serverEnv: Env;
    apiKeys?: Record<string, string>;
    providerSettings?: Record<string, IProviderSetting>;
  }) => LanguageModelV1 = (options) => {
    const { apiKeys, providerSettings, serverEnv, model } = options;
    const { apiKey } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings,
      serverEnv: serverEnv as any,
      defaultBaseUrlKey: '',
      defaultApiTokenKey: 'ASI_ONE_API_KEY',
    });
    const anthropic = createAnthropic({
      apiKey,
      headers: { 'anthropic-beta': 'output-128k-2025-02-19' },
    });

    return anthropic(model);
  };
}
