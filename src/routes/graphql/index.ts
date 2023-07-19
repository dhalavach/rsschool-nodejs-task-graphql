import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import {
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  graphql,
  parse,
  validate,
} from 'graphql';
import { MemberType, MemberTypeId } from './types/member.js';
import { ChangeProfileInput, CreateProfileInput, ProfileType } from './types/profile.js';
import { ChangePostInput, CreatePostInput, PostType } from './types/post.js';
import depthLimit from 'graphql-depth-limit';
import { ChangeUserInput, CreateUserInput, UserType } from './types/user.js';
import { UUIDType } from './types/uuid.js';
import {
  memberLoader,
  postLoader,
  profileLoader,
  subscribedToUserLoader,
  userSubscribedToLoader,
} from './loader/loaders.js';
import { Cache } from './helpers.js';
import { ResolveTree, parseResolveInfo, simplifyParsedResolveInfoFragmentWithType } from 'graphql-parse-resolve-info';

export const postCache = new Cache<any, any>(100); //fix types

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },

    async handler(req) {
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
            resolve: async (source, args, context, resolveInfo) => {
              const simplifiedFragment = simplifyParsedResolveInfoFragmentWithType(
                parseResolveInfo(resolveInfo) as ResolveTree,
                UserType,
              );

              const users = await context.prisma.user.findMany({
                include: {
                  userSubscribedTo: !!simplifiedFragment.fields.hasOwnProperty('userSubscribedTo'),
                  subscribedToUser: !!simplifiedFragment.fields.hasOwnProperty('subscribedToUser'),
                },
              });

              if (!!simplifiedFragment.fields.hasOwnProperty('subscribedToUser')) {
                const map = new Map();
                users.map((user: { id: any; subscribedToUser: any[]; }) =>
                  map.set(
                    user.id,
                    user.subscribedToUser.map((subscriber: any) => {
                      const subscriberId = subscriber.subscriberId;
                      return users.find((user: any) => user.id === subscriberId);
                    }),
                  ),
                );
                context.data.subscribers = map;
              } else {
                context.data.subscribers = null;
              }

              if (!!simplifiedFragment.fields.hasOwnProperty('userSubscribedTo')) {
                const subscriptions = new Map();
                users.map((user: { id: any; userSubscribedTo: any[]; }) =>
                  subscriptions.set(
                    user.id,
                    user.userSubscribedTo.map((sub: { authorId: any; }) => {
                      const authorId = sub.authorId;
                      return users.find((user: { id: any; }) => user.id === authorId);
                    }),
                  ),
                );
                context.data.subscriptions = subscriptions;
                return users;
              } else {
                context.data.subscriptions = null;
              }
              return users;
            },
          },

          user: {
            type: UserType,
            args: {
              id: { type: new GraphQLNonNull(UUIDType) },
            },
            resolve: async (parent, { id }, context) => {
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
        contextValue: {
          loaders: {
            profileLoader: profileLoader(prisma),
            memberLoader: memberLoader(prisma),
            postLoader: postLoader(prisma),
            userSubscribedToLoader: userSubscribedToLoader(prisma),
            subscribedToUserLoader: subscribedToUserLoader(prisma),
          },
          data: {},
          prisma: prisma,
        },
      });
      // console.log(result.errors);
      return { data: result.data, errors: result.errors };
    },
  });
};

export default plugin;
