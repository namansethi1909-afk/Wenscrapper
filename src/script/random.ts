import { queries } from "../utils/randomQuery";
// just add data to db if not avail
import { HardGif } from "../scrapper/hardgif.scrapper";
async function main() {
  const randomQuery = queries;
  try {
    const hard = new HardGif();
    for (let i = 0; i < randomQuery.length; i++) {
      await hard.getHome("1");
      console.log(`new keywords added`);
    }
  } catch (error) {
    console.log(error);
  }
}

main();
