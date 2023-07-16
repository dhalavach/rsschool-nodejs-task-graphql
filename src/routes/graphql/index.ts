import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import {
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  graphql,
  parse,
  validate,
} from 'graphql';
import { MemberType, MemberTypeId } from './types/member.js';
import { FastifyRequest, RouteGenericInterface } from 'fastify';
// import { schema } from './schemas.js';
import { PrismaClient } from '@prisma/client';
import { ChangeProfile, CreateProfile, ProfileType } from './types/profile.js';
import { ChangePost, CreatePost, PostType } from './types/post.js';
import depthLimit from 'graphql-depth-limit';
import { ChangeUser, CreateUser, UserType } from './types/user.js';
import { UUIDType } from './types/uuid.js';

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
      const queries = new GraphQLObjectType({
        name: 'queries',
        fields: {
          memberType: {
            type: MemberType,
            args: { id: { type: new GraphQLNonNull(MemberTypeId) } },
            resolve: async (parent, { id }) => {
              return await prisma.memberType.findFirst({
                where: {
                  id: id,
                },
              });
            },
          },

          memberTypes: {
            type: new GraphQLList(MemberType),
            resolve: async () => {
              return await prisma.memberType.findMany();
            },
          },

          profiles: {
            type: new GraphQLList(ProfileType),
            resolve: async () => {
              return await prisma.profile.findMany();
            },
          },

          profile: {
            type: ProfileType,
            args: { id: { type: new GraphQLNonNull(UUIDType) } },
            resolve: async (parent, { id }) => {
              return await prisma.profile.findFirst({
                where: {
                  id: id,
                },
              });
            },
          },

          posts: {
            type: new GraphQLList(PostType),
            resolve: async () => {
              return await prisma.post.findMany();
            },
          },

          post: {
            type: PostType,
            args: { id: { type: new GraphQLNonNull(UUIDType) } },
            resolve: async (parent, { id }) => {
              return await prisma.post.findFirst({
                where: {
                  id: id,
                },
              });
            },
          },

          users: {
            type: new GraphQLList(UserType),
            resolve: async () => {
              return await prisma.user.findMany();
            },
          },

          user: {
            type: UserType,
            args: {
              id: { type: new GraphQLNonNull(UUIDType) },
            },
            resolve: async (parent, { id }) => {
              return await prisma.user.findFirst({
                where: {
                  id: id,
                },
              });
            },
          },
        },
      });

      const mutations = new GraphQLObjectType({
        name: 'mutation',
        fields: {
          createUser: {
            type: UserType,
            args: {
              data: { type: CreateUser },
            },
            resolve: async (parents, { data }) => {
              return await new PrismaClient().user.create({ data: data });
            },
          },
          createProfile: {
            type: ProfileType,
            args: {
              data: { type: CreateProfile },
            },
            resolve: async (parents, { data }) => {
              return prisma.profile.create({ data: data });
            },
          },
          createPost: {
            type: PostType,
            args: {
              data: { type: CreatePost },
            },
            resolve: async (parent, { data }) => {
              return prisma.post.create({ data: data });
            },
          },
          changeUser: {
            type: UserType,
            args: {
              id: { type: new GraphQLNonNull(UUIDType) },
              data: { type: new GraphQLNonNull(ChangeUser) },
            },
            resolve: async (parents, { id, data }) => {
              return await prisma.user.update({
                where: {
                  id: id,
                },
                data: data,
              });
            },
          },

          deleteUser: {
            type: GraphQLBoolean,
            args: {
              id: { type: new GraphQLNonNull(UUIDType) },
            },
            resolve: async (parent, { id }) => {
              try {
                await prisma.user.delete({
                  where: {
                    id: id,
                  },
                });
                return true;
              } catch (error) {
                console.log(error);
                return false;
              }
            },
          },

          updateProfile: {
            type: ProfileType,
            args: {
              id: { type: GraphQLString },
              data: { type: ChangeProfile },
            },
            resolve: async (parent, { id, data }) => {
              const profile = await prisma.profile.update({
                where: {
                  id: id,
                },
                data: data,
              });
            },
          },
          // updateMemberType: {
          //   type: memberTypeGraphType,
          //   args: {
          //     id: { type: GraphQLString },
          //     data: { type: memberTypeUpdateType },
          //   },
          //   resolve: async (parents, args) => {
          //     const data = request.body.variables?.data as MemberTypeEntity;
          //     const id = request.body.variables?.id as string;
          //     const memberType = await fastify.db.memberTypes.findOne({
          //       key: 'id',
          //       equals: id,
          //     });
          //     if (memberType) {
          //       return await fastify.db.memberTypes.change(id, data);
          //     }
          //   },
          // },
          subscribeTo: {
            type: UserType,
            args: {
              userToSubscribeId: { type: new GraphQLNonNull(UUIDType) },
              userId: { type: new GraphQLNonNull(UUIDType) },
            },
            resolve: async (parents, { userId, authorId }) => {
              return await prisma.subscribersOnAuthors.create({
                data: {
                  subscriberId: userId,
                  authorId: authorId,
                },
              });
            },
          },
          unsubscribeFrom: {
            type: UserType,
            args: {
              userUnsubscribeFromId: { type: new GraphQLNonNull(UUIDType) },
              userId: { type: new GraphQLNonNull(UUIDType) },
            },
            resolve: async (parent, { userId, authorId }) => {
              return await prisma.subscribersOnAuthors.deleteMany({
                where: {
                  subscriberId: userId,
                  authorId: authorId,
                },
              });
            },
          },
        },
      });

      const schema = new GraphQLSchema({
        query: queries,
        mutation: mutations,
      });

      // const parsedQuery = parse(req.body.query);
      // const validationErrors = validate(schema, parsedQuery, [depthLimit(5)]);
      // if (validationErrors && validationErrors.length != 0) {
      //   return { data: '', errors: validationErrors };
      // }

      const result = await graphql({
        schema: schema,
        source: String(req.body?.query), //request.body.query
        // contextValue: fastify,
        variableValues: req.body.variables,
      });

      //return { data: result.data, errors: result.errors };
      //return { ...result.data, ...result.errors };
      return result;
    },
  });
};

export default plugin;
