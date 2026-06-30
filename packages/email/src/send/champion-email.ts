import { sendReactEmail } from "../client";
import { requireUserName } from "../require-user-name";
import { type ChampionEmailSendInput } from "../types";
import { buildAppUrl } from "../urls";
import {
  ChampionEmail,
  getChampionEmailTitle,
} from "../templates/champion-email";

export const sendChampionEmail = async (
  input: ChampionEmailSendInput,
): Promise<void> => {
  const name = requireUserName(
    input.name,
    "Bruger mangler navn — kan ikke sende mester-e-mail",
  );

  const props = {
    name,
    festivalName: input.festivalName,
    leaguePoints: input.leaguePoints,
    appUrl: buildAppUrl(),
  };

  await sendReactEmail({
    emailType: "champion",
    to: input.to,
    subject: getChampionEmailTitle(props),
    react: ChampionEmail(props),
  });
};

export { getChampionEmailTitle } from "../templates/champion-email";
