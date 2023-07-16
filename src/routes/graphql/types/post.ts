import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInputObjectType,
} from 'graphql';
import { UserType } from './user.js';
import { UUIDType } from './uuid.js';
import { PrismaClient } from '@prisma/client';

export const PostType = new GraphQLObjectType({
  name: 'post',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
    title: {
      type: new GraphQLNonNull(GraphQLString),
    },
    content: {
      type: new GraphQLNonNull(GraphQLString),
    },
    author: {
      type: new GraphQLNonNull(UserType),
      resolve(args) {
        return new PrismaClient().user.findFirst({
          where: {
            id: args.authorId,
          },
        });
      },
    },
    authorId: {
      type: new GraphQLNonNull(UUIDType),
    },
  }),
});

export const CreatePost = new GraphQLInputObjectType({
  name: 'CreatePost',
  fields: {
    authorId: { type: UUIDType },
    content: { type: GraphQLString },
    title: { type: GraphQLString },
  },
});

export const ChangePost = new GraphQLInputObjectType({
  name: 'ChangePost',
  fields: {
    title: { type: GraphQLString },
    content: { type: GraphQLString },
  },
});
