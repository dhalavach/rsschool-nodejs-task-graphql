import { GraphQLObjectType, GraphQLString, GraphQLFloat, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLInputObjectType } from 'graphql';
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
      resolve: async (source, args, context) => {
        return await context.loaders.profileLoader.load(source.id);
      },
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: async (source, args, context) => {
        console.log('calling post loader from user with source.id:' + source.id);
        return await context.loaders.postLoader.load(source.id);
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: async (source, args, context) => {
        // let temp = await new PrismaClient().subscribersOnAuthors.findMany({
        //   where: {
        //     subscriberId: id,
        //   },
        //   select: {
        //     author: true,
        //   },
        // });
        // return temp.map((a) => a.author);

        return await context.loaders.userSubscribedToLoader.load(source?.id);
      },
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: async (source, args, context) => {
        // let temp = await new PrismaClient().subscribersOnAuthors.findMany({
        //   where: {
        //     authorId: id,
        //   },
        //   select: {
        //     subscriber: true,
        //   },
        // });
        // return temp.map((s) => s.subscriber);
        return await context.loaders.subscribedToUserLoader.load(source?.id);
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
