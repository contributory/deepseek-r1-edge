export async function onRequest({ request, env }: any) {
  const allowedModels = [
    'deepseek-r1-distill-qwen-32b',
    'deepseek-r1-0528',
    'deepseek-v3-0324',
  ];
  const modelsData = [];
  for (const model of allowedModels) {
    modelsData.push({
      id: model,
      object: 'model',
      name: model.split('/').pop(),
      owned_by: 'edgeone',
    });
  }
  return new Response(
    JSON.stringify({
      data: modelsData,
      object: 'list',
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
