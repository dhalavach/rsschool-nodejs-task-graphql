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
  name: 'UserType',
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
      resolve: async ({ id }) => {
        return await new PrismaClient().profile.findFirst({
          where: {
            userId: id,
          },
        });
      },
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: async (args) => {
        return await new PrismaClient().post.findMany({
          where: {
            authorId: args.id,
          },
        });
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: async ({ id }) => {
        let temp = await new PrismaClient().subscribersOnAuthors.findMany({
          where: {
            subscriberId: id,
          },
          select: {
            author: true,
          },
        });
        return temp.map((a) => a.author);
      },
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: async ({ id }) => {
        let temp = await new PrismaClient().subscribersOnAuthors.findMany({
          where: {
            authorId: id,
          },
          select: {
            subscriber: true,
          },
        });
        return temp.map((s) => s.subscriber);
      },
    },
  }),
});

export const CreateUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  }),
});

export const ChangeUserInput = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: () => ({
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  }),
});
