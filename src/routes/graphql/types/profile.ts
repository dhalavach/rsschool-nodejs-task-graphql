import { GraphQLFloat, GraphQLInputObjectType, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLString } from 'graphql';
import { UUIDType } from './uuid.js';
import { UserType } from './user.js';
import { PrismaClient } from '@prisma/client';
import { MemberType, MemberTypeId } from './member.js';

export const ProfileType = new GraphQLObjectType({
  name: 'ProfileType',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    userId: { type: new GraphQLNonNull(UUIDType) },

    user: {
      type: new GraphQLNonNull(UserType),
      resolve: async ({ userId }, args, context) => {
        return context.prisma.user.findFirst({
          where: {
            id: userId,
          },
        });
      },
    },

    memberType: {
      type: MemberType,
      resolve: async (source, args, context) => {
        // console.log('calling member type loader from profile type...');
        const result = await context.loaders.memberLoader.load(source.memberTypeId); //id?
        return result;
      },
    },
    memberTypeId: { type: new GraphQLNonNull(MemberTypeId) },
  }),
});

export const ChangeProfileInput = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: () => ({
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
