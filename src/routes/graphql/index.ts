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
    },

    async handler(req, reply) {
      const query = new GraphQLObjectType({
        name: 'query',
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

      const mutation = new GraphQLObjectType({
        name: 'mutation',
        fields: {
          //User
          createUser: {
            type: UserType,
            args: {
              data: { type: new GraphQLNonNull(CreateUser) },
            },
            resolve: async (parent, { data }) => {
              return prisma.user.create({ data: data });
            },
          },
          changeUser: {
            type: UserType,
            args: {
              id: { type: new GraphQLNonNull(UUIDType) },
              data: { type: new GraphQLNonNull(ChangeUser) },
            },
            resolve: async (parent, { id, data }) => {
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

          //Profile
          createProfile: {
            type: ProfileType,
            args: {
              data: { type: CreateProfile },
            },
            resolve: async (parents, { data }) => {
              return await prisma.profile.create({ data: data });
            },
          },
          changeProfile: {
            type: ProfileType,
            args: {
              id: { type: new GraphQLNonNull(UUIDType) },
              data: { type: ChangeProfile },
            },
            resolve: async (parent, { id, data }) => {
              return await prisma.profile.update({
                where: {
                  userId: id,
                },
                data: data,
              });
            },
          },
          deleteProfile: {
            type: GraphQLBoolean,
            args: {
              id: { type: new GraphQLNonNull(UUIDType) },
            },
            resolve: async (parent, { id }) => {
              try {
                await prisma.profile.findFirst({
                  where: {
                    userId: id,
                  },
                });
                return true;
              } catch (error) {
                console.log(error);
                return false;
              }
            },
          },

          //Post
          createPost: {
            type: PostType,
            args: {
              data: { type: CreatePost },
            },
            resolve: async (parent, { data }) => {
              // const user = await prisma.user.findFirst({
              //   where: {
              //     id: data.authorId,
              //   },
              // });
              return await prisma.post.create({ data: data });
            },
          },
          changePost: {
            type: PostType,
            args: {
              id: { type: new GraphQLNonNull(UUIDType) },
              data: { type: new GraphQLNonNull(ChangePost) },
            },
            resolve: async (parent, { id, data }) => {
              return await prisma.post.update({
                where: {
                  id: id,
                },
                data: data,
              });
            },
          },
          deletePost: {
            type: GraphQLBoolean,
            args: {
              id: { type: new GraphQLNonNull(UUIDType) },
            },
            resolve: async (parent, { id }) => {
              try {
                await prisma.post.delete({
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

          //Subscriptions
          subscribeTo: {
            type: UserType,
            args: {
              authorId: { type: new GraphQLNonNull(UUIDType) },
              userId: { type: new GraphQLNonNull(UUIDType) },
            },
            resolve: async (parents, { userId, authorId }) => {
              await prisma.subscribersOnAuthors.create({
                data: {
                  subscriberId: userId,
                  authorId: authorId,
                },
              });
              return await prisma.user.findFirst({
                where: {
                  id: userId,
                },
              });
            },
          },
          unsubscribeFrom: {
            type: GraphQLBoolean,
            args: {
              userId: { type: new GraphQLNonNull(UUIDType) },
              authorId: { type: new GraphQLNonNull(UUIDType) },
            },
            resolve: async (parent, { userId, authorId }) => {
              try {
                await prisma.subscribersOnAuthors.deleteMany({
                  where: {
                    subscriberId: userId,
                    authorId: authorId,
                  },
                });
                return true;
              } catch (error) {
                console.log(error);
                return false;
              }
            },
          },
        },
      });

      const schema = new GraphQLSchema({
        query,
        mutation,
      });

      const validationErrors = validate(schema, parse(req.body.query), [depthLimit(5)]);
      if (validationErrors && validationErrors.length !== 0) {
        return { data: '', errors: validationErrors };
      }

      return await graphql({
        schema: schema,
        source: req.body.query,
        variableValues: req.body.variables,
      });
    },
  });
};

export default plugin;
