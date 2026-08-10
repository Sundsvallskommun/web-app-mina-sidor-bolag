import { Controller, Get } from 'routing-controllers';
import { Public } from '@middlewares/global-auth';

@Controller()
export class IndexController {
  @Get('/')
  @Public('Service root - returns a constant, no user context')
  index() {
    return 'OK';
  }
}
