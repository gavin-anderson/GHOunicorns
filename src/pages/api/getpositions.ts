import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const walletAddress = req.query.walletAddress as string;
    const url = `https://cush.apiary.software/optimism?method=cush_getPositions&params=[{"user": "0xB1db41Aa2484E3f5f5a510e07003C29Fd1b0F115"}]`;

    const response = await fetch(url);
    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching positions" });
  }
}
