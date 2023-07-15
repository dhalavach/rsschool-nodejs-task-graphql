import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import {
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  graphql,
} from 'graphql';
import { MemberType } from './types/member.js';
import { FastifyRequest, RouteGenericInterface } from 'fastify';
// import { schema } from './schemas.js';
import { PrismaClient } from '@prisma/client';

const plugin: FastifyPluginAsyncTypebox = async (fastify): Promise<void> => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },

      // response: {
      //   200: graphQLBodySchema,
      //   404: null,
      // },
    },

    async handler(req, reply) {
      const query = new GraphQLObjectType({
        name: 'query',
        fields: {
          getMemberType: {
            type: MemberType,
            args: { id: { type: GraphQLString } },

            resolve: async (parent, args) => {
              const memberType = await prisma.memberType.findUnique({
                where: {
                  id: args.id,
                },
              });
              return memberType;
            },
          },
          getAllMemberTypes: {
            type: new GraphQLList(MemberType),
            resolve: async () => {
              const res = await prisma.memberType.findMany();
              return res;
            },
          },
        },
      });

      const testSchema = new GraphQLSchema({
        query: query,
      });

      const result = await graphql({
        schema: testSchema,
        source: String(req.body?.query), //request.body.query
        contextValue: fastify,
      });

      return result;
    },
  });
};

export default plugin;
