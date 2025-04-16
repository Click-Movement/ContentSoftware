
/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'wpapi' {
  interface WPAPIOptions {
    endpoint: string;
    username: string;
    password: string;
  }

  interface WPAPIMedia {
    file(file: Buffer, fileName: string): {
      create(data: any): Promise<any>;
    };
  }

  interface WPAPIPosts {
    create(data: any): Promise<any>;
  }

  class WPAPI {
    constructor(options: WPAPIOptions);
    media(): WPAPIMedia;
    posts(): WPAPIPosts;
  }

  export default WPAPI;
}
