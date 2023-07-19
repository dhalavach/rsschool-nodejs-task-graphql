// import { Type } from '@fastify/type-provider-typebox';
import { GraphQLEnumType, GraphQLList, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { GraphQLFloat, GraphQLInt } from 'graphql';
import { ProfileType } from './profile.js';


export const MemberTypeId = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    basic: { value: 'basic' },
    business: { value: 'business' },
  },
});

export const MemberType = new GraphQLObjectType({
  name: 'MemberType',
  fields: () => ({
    id: {
      type: MemberTypeId,
    },
    discount: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
    postsLimitPerMonth: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    profiles: {
      type: new GraphQLList(ProfileType),
      resolve: async ({id}, args, context) => {
        return await context.prisma.profile.findMany({
          where: {
            memberTypeId: id,
          },
        });
      },
    },
  }),
});
