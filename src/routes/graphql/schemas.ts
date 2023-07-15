import { Type } from '@fastify/type-provider-typebox';
import { GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import { MemberType } from './types/member.js';

export const gqlResponseSchema = Type.Partial(
  Type.Object({
    data: Type.Any(),
    errors: Type.Any(),
  }),
);

export const createGqlResponseSchema = {
  body: Type.Object(
    {
      query: Type.String(),
      variables: Type.Optional(Type.Record(Type.String(), Type.Any())),
    },
    {
      additionalProperties: false,
    },
  ),
};

// check this !!!
// export const graphQLBodySchema = {
//   type: 'object',
//   properties: {
//     mutation: { type: 'string' },
//     query: { type: 'string' },
//     variables: {
//       type: 'object',
//     },
//   },
//   oneOf: [
//     {
//       type: 'object',
//       required: ['query'],
//       properties: {
//         query: { type: 'string' },
//         variables: {
//           type: 'object',
//         },
//       },
//       additionalProperties: false,
//     },
//     {
//       type: 'object',
//       required: ['mutation'],
//       properties: {
//         mutation: { type: 'string' },
//         variables: {
//           type: 'object',
//         },
//       },
//       additionalProperties: false,
//     },
//   ],
// };



// const RootQuery = new GraphQLObjectType({
//   name: 'RootQueryType',
//   fields: {
//     book: {
//       type: MemberType,
//       args: { id: { type: GraphQLString }},
//       resolve(parent, args){

//       }
//     }
//   }
// });

// export const schema = new GraphQLSchema({
//   query: RootQuery
// });