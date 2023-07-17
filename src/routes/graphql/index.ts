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
import { ChangeProfileInput, CreateProfileInput, ProfileType } from './types/profile.js';
import { ChangePostInput, CreatePostInput, PostType } from './types/post.js';
import depthLimit from 'graphql-depth-limit';
import { ChangeUserInput, CreateUserInput, UserType } from './types/user.js';
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
              dto: { type: new GraphQLNonNull(CreateUserInput) },
            },
            resolve: async (parent, { dto }) => {
              return prisma.user.create({ data: dto });
            },
          },
          changeUser: {
            type: UserType,
            args: {
              id: { type: new GraphQLNonNull(UUIDType) },
              dto: { type: new GraphQLNonNull(ChangeUserInput) },
            },
            resolve: async (parent, { id, dto }) => {
              return await prisma.user.update({
                where: {
                  id: id,
                },
                data: dto,
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
              dto: { type: new GraphQLNonNull(CreateProfileInput) },
            },

            resolve: async (parents, { dto }) => {
              try {
                return prisma.profile.create({ data: dto });
              } catch (error) {
                console.log(error);
              }
            },
          },
          changeProfile: {
            type: ProfileType,
            args: {
              id: { type: new GraphQLNonNull(UUIDType) },
              dto: { type: new GraphQLNonNull(ChangeProfileInput) },
            },
            resolve: async (parent, { id, dto }) => {
              return await prisma.profile.update({
                where: {
                  id: id,
                },
                data: dto,
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
                await prisma.profile.delete({
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

          //Post
          createPost: {
            type: PostType,
            args: {
              dto: { type: CreatePostInput },
            },
            resolve: async (parent, { dto }) => {
              return prisma.post.create({ data: dto });
            },
          },
          changePost: {
            type: PostType,
            args: {
              id: { type: new GraphQLNonNull(UUIDType) },
              dto: { type: new GraphQLNonNull(ChangePostInput) },
            },
            resolve: async (parent, { id, dto }) => {
              return await prisma.post.update({
                where: {
                  id: id,
                },
                data: dto,
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

      const result = await graphql({
        schema: schema,
        source: req.body.query,
        variableValues: req.body.variables,
      });
      console.log(result.errors);
      return { data: result.data, errors: result.errors };
    },
  });
};

export default plugin;
