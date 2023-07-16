import { GraphQLInputObjectType, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLString } from 'graphql';
import { UUIDType } from './uuid.js';
import { UserType } from './user.js';
import { PrismaClient } from '@prisma/client';
import { MemberType } from './member.js';

export const ProfileType = new GraphQLObjectType({
  name: 'profile',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    user: {
      type: UserType,
      resolve: (args) => {
        return new PrismaClient().user.findFirst({
          where: {
            id: args.userId,
          },
        });
      },
    },
    userId: { type: new GraphQLNonNull(UUIDType) },
    memberType: {
      type: MemberType,
      resolve: (args) => {
        return new PrismaClient().memberType.findFirst({
          where: {
            id: args.memberTypeId,
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
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
  }),
});

export const CreateProfile = new GraphQLInputObjectType({
  name: 'CreateProfile',
  fields: {
    userId: { type: new GraphQLNonNull(UUIDType) },
    memberTypeId: { type: new GraphQLNonNull(GraphQLString) },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
  },
});
