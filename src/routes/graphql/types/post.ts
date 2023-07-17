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
  name: 'PostType',
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
    authorId: {
      type: new GraphQLNonNull(GraphQLString),
    },
    author: {
      type: UserType,
      resolve: async ({ authorId }) => {
        return new PrismaClient().user.findFirst({
          where: {
            id: authorId,
          },
        });
      },
    },
  }),
});

export const CreatePostInput = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: () => ({
    authorId: { type: UUIDType },
    content: { type: GraphQLString },
    title: { type: GraphQLString },
  }),
});

export const ChangePostInput = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: () => ({
    title: { type: GraphQLString },
    content: { type: GraphQLString },
  }),
});
