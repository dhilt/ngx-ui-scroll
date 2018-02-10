import { Observable } from 'rxjs';
import { Datasource } from '../../src/component/interfaces/datasource';

export const datasourceStore = {

  'initial': <Datasource>{
    get: (index: number, count: number) =>
      Observable.create(observer => {
        setTimeout(() => {
          let data = [];
          for (let i = index; i <= index + count - 1; i++) {
            data.push({ id: i, text: "item #" + i });
          }
          observer.next(data);
        }, 15);
      }),

    settings: {
      bufferSize: 5,
      padding: 0.5
    }
  }

};
