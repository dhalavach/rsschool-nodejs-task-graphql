// import { Type } from '@fastify/type-provider-typebox';
import { GraphQLEnumType, GraphQLList, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { GraphQLFloat, GraphQLID, GraphQLInt, GraphQLString } from 'graphql';
import { ProfileType } from './profile.js';
import { PrismaClient } from '@prisma/client';

// enum MemberTypeId {
//   BASIC = 'basic',
//   BUSINESS = 'business',
// }

// export const MemberTypeId = new GraphQLEnumType({
//   name: "MemberTypeId",
//   values: {
//     basic: { value: "basic"},
//     business: {value: "business"},
//   }
// })

export const MemberType = new GraphQLObjectType({
  name: 'member',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
    },
    discount: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
    postsLimitPerMonth: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    profiles: {
      type: new GraphQLList(ProfileType),
      resolve: async (args) => {
        return await new PrismaClient().profile.findMany({
          where: {
            memberTypeId: args.id,
          },
        });
      },
    },
  }),
});
