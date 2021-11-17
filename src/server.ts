import app from './loader';
import * as db from './db';

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  await db.init();
  console.log(`Server listening on ${PORT}`);
});
