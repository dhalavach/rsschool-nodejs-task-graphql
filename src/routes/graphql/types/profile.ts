import {
  GraphQLFloat,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLObjectType,
} from 'graphql';
import { GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLString } from 'graphql';
import { UUIDType } from './uuid.js';
import { UserType } from './user.js';
import { PrismaClient } from '@prisma/client';
import { MemberType, MemberTypeId } from './member.js';
const prisma = new PrismaClient();

export const ProfileType = new GraphQLObjectType({
  name: 'ProfileType',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    userId: { type: new GraphQLNonNull(UUIDType) },

    user: {
      type: UserType,
      resolve: async ( { userId }) => {
        return  prisma.user.findFirst({
          where: {
            id: userId,
          },
        });
      },
    },
    memberType: {
      type: MemberType,
      resolve: async ({ memberTypeId }) => {
        return prisma.memberType.findFirst({
          where: {
            id: memberTypeId,
          },
        });
      },
    },
    memberTypeId: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

export const ChangeProfileInput = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: () => ({
    //userId: { type: UUIDType },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
  }),
});

// isMale: profileFields.isMale,
// yearOfBirth: profileFields.yearOfBirth,
// memberTypeId: profileFields.memberTypeId,
// userId: profileFields.userId,

export const CreateProfileInput = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: () => ({
    userId: { type: new GraphQLNonNull(UUIDType) },
    memberTypeId: { type: new GraphQLNonNull(MemberTypeId) },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
  }),
});
