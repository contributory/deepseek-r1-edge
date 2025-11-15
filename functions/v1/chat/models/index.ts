export async function onRequest({ request, env }: any) {
  const allowedModels = [
    '@tx/deepseek-ai/deepseek-r1-distill-qwen-32b',
    '@tx/deepseek-ai/deepseek-r1-0528',
    '@tx/deepseek-ai/deepseek-v3-0324',
  ];
  const modelsData = [];
  for (const model of allowedModels) {
    modelsData.push({
      id: model,
      object: 'model',
      name: model.split('/').pop(),
    });
    modelsData.push({
      id: model + ':online',
      object: 'model',
      name: model.split('/').pop() + ':online',
    });
  }
  return {
    statusCode: 200,
    body: JSON.stringify({
      data: modelsData,
      object: 'list',
    }),
  };
}
