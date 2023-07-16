import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import {
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  graphql,
  parse,
  validate,
} from 'graphql';
import { MemberType } from './types/member.js';
import { FastifyRequest, RouteGenericInterface } from 'fastify';
// import { schema } from './schemas.js';
import { PrismaClient } from '@prisma/client';
import { ProfileType } from './types/profile.js';
import { PostType } from './types/post.js';
import depthLimit from 'graphql-depth-limit';

const plugin: FastifyPluginAsyncTypebox = async (fastify): Promise<void> => {
  //const { prisma } = fastify;
  const prisma = new PrismaClient();

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

    async handler(req) {
      const query = new GraphQLObjectType({
        name: 'query',
        fields: {
          getMemberType: {
            type: MemberType,
            args: { id: { type: GraphQLString } },
            resolve: async (_, args) => {
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

          getAllProfiles: {
            type: new GraphQLList(ProfileType),
            resolve: async () => {
              return await prisma.profile.findMany();
            },
          },

          getAllPosts: {
            type: new GraphQLList(PostType),
            resolve: async () => {
              return await prisma.post.findMany();
            },
          },
        },
      });

      const schema = new GraphQLSchema({
        query: query,
      });

      const parsedQuery = parse(req.body.query);
      const validationErrors = validate(schema, parsedQuery, [depthLimit(5)]);
      if (validationErrors && validationErrors.length != 0) {
        return { data: '', errors: validationErrors };
      }

      const result = await graphql({
        schema: schema,
        source: req.body?.query, //request.body.query
        contextValue: fastify,
        variableValues: req.body.variables,
      });

      //return { data: result.data, errors: result.errors };
      //return { ...result.data, ...result.errors };
      return result;
    },
  });
};

export default plugin;
