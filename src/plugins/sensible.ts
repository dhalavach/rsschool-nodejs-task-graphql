import fp from 'fastify-plugin';
import sensible from '@fastify/sensible';

// export default fp(async (fastify) => fastify.register(sensible));
export const sensiblePluginTag = 'sensiblePluginTag';

export default fp(async (fastify) => fastify.register(sensible), {
  name: sensiblePluginTag,
});
