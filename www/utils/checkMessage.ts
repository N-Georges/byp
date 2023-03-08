const checkMessage = (message: string) => (arr: any[]) => {
  let status;
  if (arr.length) {
    arr.forEach((error: any) => {
      if (error.message.includes(message)) {
        status = true;
      }
    });
  }
  return status;
};

export default checkMessage;
