let users: {id: string; channel: string}[] = [];

export const userJoin = (id: string, channel: string): boolean => {
  const user = users.find((user) => user.channel === channel);

  if (user) {
    return false;
  }

  users.push({id, channel});
  return true;
};

export const userLeft = (id: string): void => {
  users = users.filter((user) => user.id !== id);
};

export const getUsers = (): any => users;
