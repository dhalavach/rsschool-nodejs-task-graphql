// import { Type } from '@fastify/type-provider-typebox';
import { GraphQLObjectType } from 'graphql';
import { GraphQLFloat, GraphQLID, GraphQLInt, GraphQLString } from 'graphql';

enum MemberTypeId {
  BASIC = 'basic',
  BUSINESS = 'business',
}

// export const memberGraphType = new GraphQLObjectType({
//   name: 'member',
//   fields: () => ({
//     id: { type: GraphQLString },
//     discount: { type: GraphQLFloat },
//     postLimitPerMonth: { type: GraphQLInt },
//   }),
// });

export const MemberType = new GraphQLObjectType({
  name: 'member',
  fields: {
    id: {
      type: GraphQLString,
    },
    discount: {
      type: GraphQLFloat,
    },
    monthPostsLimit: {
      type: GraphQLInt,
    },
  },
});
