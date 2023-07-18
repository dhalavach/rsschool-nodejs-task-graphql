import { MemberType, Post, Prisma, PrismaClient, Profile } from '@prisma/client';
import DataLoader from 'dataloader';

// export const profileLoader = (prisma) => {
//   return new DataLoader(async (keys: Readonly<string[]>) => {
//     const profiles = await prisma.profile.findMany({
//       where: {
//         userId: { in: keys as Prisma.Enumerable<string> | undefined },
//       },
//     });

//     const profileMap = new Map();

//     profiles.forEach((profile) => {
//       profileMap.set(profile.userId, profile);
//     });
//     const profilesArr = new Array<any>();
//     keys.forEach((key) => {
//       profilesArr.push(profileMap.get(key));
//     });
//     return new Promise((resolve) => resolve(profilesArr));
//   });
// };

//add literal type
// export const createLoader = (loaderType: 'memberType') => {
//   return new DataLoader(async (keys: Readonly<string[]>) => {
//     const typeArr = await new PrismaClient()[loaderType].findMany({
//       where: {
//         id: { in: keys as Prisma.Enumerable<string> | undefined },
//       },
//     });
//     const typeMap = new Map();
//     //@ts-ignore
//     typeArr.forEach((t) => typeMap.set([loaderType].id, t));
//     const resArr = new Array<any>();
//     keys.forEach((key) => {
//       resArr.push(typeMap.get(key));
//     });

//     return new Promise((resolve) => resolve(resArr));
//   });
// };

export const profileLoader = (prisma: PrismaClient) => {
  return new DataLoader(async (keys: Readonly<string[]>): Promise<Array<Profile>> => {
    const profiles = (await prisma.profile.findMany({
      where: {
        userId: { in: keys as string[] },
      },
    })) as Profile[];
    const map = new Map();
    profiles.forEach((profile) => {
      map.set(profile.userId, profile);
    });
    const arr = new Array<Profile>();
    keys.forEach((key) => {
      arr.push(map.get(key) as Profile);
    });
    // return new Promise((resolve) => resolve(arr));
    return arr;
  });
};

export const memberLoader = (prisma: PrismaClient) => {
  return new DataLoader(async (keys: Readonly<string[]>): Promise<Array<MemberType>> => {
    const arr = await prisma.memberType.findMany({
      where: {
        id: { in: keys as string[] |undefined },
      },
    });
    const map = new Map();
    arr.forEach((memberType) => map.set(memberType.id, memberType));
    const resArr = new Array<MemberType>();
    keys.forEach((key) => {
      resArr.push(map.get(key));
    });
    // return new Promise((resolve) => resolve(resArr));
    return resArr;
  });
  //return new DataLoader(getMembersById);
};

export const postLoader = (prisma: PrismaClient) => {
  return new DataLoader(async (keys: Readonly<string[]>): Promise<Array<Post[]>> => {
    const posts: Array<Post> = await prisma.post.findMany({
      where: {
        authorId: { in: keys as string[] | undefined },
      },
    });
    const map = new Map();
    posts.forEach((post) => {
      // const authorArr = map.get(post.authorId) || [];
      const authorArr = map.get(post.authorId) ? map.get(post.authorId) : [];
      authorArr.push(post);
      map.set(post.authorId, authorArr);
    });
    const result = new Array<Post[]>();
    keys.forEach((key) => {
      result.push(map.get(key) as Post[]);
    });
    // return new Promise((resolve) => resolve(result));
    return result;
  });
  //return new DataLoader(getPostsById);
};

export const userSubscribedToLoader = (prisma: PrismaClient) => {
  const getSubscribersById = async (keys: Readonly<string[]>) => {
    let arr = await prisma.subscribersOnAuthors.findMany({
      where: {
        subscriberId: { in: keys as string[] |undefined },
      },
      select: {
        author: true,
        subscriberId: true,
      },
    });
    // return arr.map((a) => a.author);
    const map = new Map();
    arr.forEach((e) => {
      let subscriptionsArr = map.get(e) ? map.get(e) : [];
      subscriptionsArr.push(e.author);
      map.set(e.subscriberId, subscriptionsArr);
    });
    const result = new Array<any>();
    keys.forEach((k) => result.push(map.get(k)));
    return result;
  };
  return new DataLoader(getSubscribersById);
};

export const subscribedToUserLoader = (prisma: PrismaClient) => {
  const getSubscriptions = async (keys: Readonly<string[]>) => {
    const temp = await prisma.subscribersOnAuthors.findMany({
      where: {
        authorId: { in: keys as string[] | undefined },
      },
      select: {
        subscriber: true,
        authorId: true,
      },
    });

    const map = new Map();
    temp.forEach((e) => {
      let subscriptionsArr = map.get(e.authorId) ? map.get(e) : [];
      subscriptionsArr.push(e.subscriber);
      map.set(e.authorId, subscriptionsArr);
    });
    const result = new Array<any>();
    keys.forEach((k) => result.push(map.get(k)));
    return result;
  };

  return new DataLoader(getSubscriptions);
};
