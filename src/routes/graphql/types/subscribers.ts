import { GraphQLObjectType } from 'graphql';
import { GraphQLString } from 'graphql';
import { UserType } from './user.js';

export const SubscribersOnAuthorsType = new GraphQLObjectType({
  name: 'subscriber',
  fields: () => ({
    subscriber: { type: UserType },
    subscriberId: { type: GraphQLString },
    author: { type: UserType },
    authorId: { type: GraphQLString },
  }),
});
