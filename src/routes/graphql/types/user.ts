import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInputObjectType,
} from 'graphql';
import { ProfileType } from './profile.js';
import { PostType } from './post.js';
import { SubscribersOnAuthorsType } from './subscribers.js';
import { UUIDType } from './uuid.js';
import { PrismaClient } from '@prisma/client';

export const UserType = new GraphQLObjectType({
  name: 'user',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
    balance: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
    profile: {
      type: ProfileType,
      resolve: async (args) => {
        return await new PrismaClient().profile.findFirst({
          where: {
            userId: args.id,
          },
        });
      },
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: async (args) => {
        return await new PrismaClient().post.findMany({
          where: {
            authorId: args.id, //check
          },
        });
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: async (args) => {
        return (
          await new PrismaClient().subscribersOnAuthors.findMany({
            where: {
              subscriberId: args.id,
            },
            select: {
              author: true,
            },
          })
        ).map((a) => a.author);
      },
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: async (args) => {
        return (
          await new PrismaClient().subscribersOnAuthors.findMany({
            where: {
              authorId: args.id,
            },
            select: {
              subsriber: true,
            },
          })
        ).map((s) => s.subsriber);
      },
    },
  }),
});

export const CreateUser = new GraphQLInputObjectType({
  name: 'CreateUser',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  },
});

export const ChangeUserInput = new GraphQLInputObjectType({
  name: 'ChangeUser',
  fields: {
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  },
});
