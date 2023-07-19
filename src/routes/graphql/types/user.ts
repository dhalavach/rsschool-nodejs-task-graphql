import { GraphQLObjectType, GraphQLString, GraphQLFloat, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLInputObjectType } from 'graphql';
import { ProfileType } from './profile.js';
import { PostType } from './post.js';
import { UUIDType } from './uuid.js';

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
        // console.log('calling post loader from user with source.id:' + source.id);
        return await context.loaders.postLoader.load(source.id);
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: async ({ id }, args, context) => {
        return context.data.subscriptions ? context.data.subscriptions.get(id) : await context.loaders.userSubscribedToLoader.load(id);
      },
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: async ({ id }, args, context) => {
        return context.data.subscribers ? context.data.subscribers.get(id) : await context.loaders.subscribedToUserLoader.load(id);
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
