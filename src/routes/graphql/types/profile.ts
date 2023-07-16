import { GraphQLInputObjectType, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLString } from 'graphql';
import { UUIDType } from './uuid.js';
import { UserType } from './user.js';
import { PrismaClient } from '@prisma/client';
import { MemberType } from './member.js';
const prisma = new PrismaClient()

export const ProfileType = new GraphQLObjectType({
  name: 'profile',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    user: {
      type: UserType,
      resolve: async ({ userId }) => {
        return await prisma.user.findFirst({
          where: {
            id: userId,
          },
        });
      },
    },
    userId: { type: new GraphQLNonNull(UUIDType) },
    memberType: {
      type: MemberType,
      resolve: ({ memberTypeId }) => {
        return  prisma.memberType.findFirst({
          where: {
            id: memberTypeId,
          },
        });
      },
    },
    memberTypeId: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

export const ChangeProfile = new GraphQLInputObjectType({
  name: 'ChangeProfile',
  fields: () => ({
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
  }),
});

export const CreateProfile = new GraphQLInputObjectType({
  name: 'CreateProfile',
  fields: {
    userId: { type: new GraphQLNonNull(UUIDType) },
    memberTypeId: { type: new GraphQLNonNull(GraphQLString) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
  },
});
