"use client";
import L1Hash from "@/components/past-games/l1-hash";
import ViewMetadata from "@/components/past-games/view-metadata";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAddress, formatHash } from "@/core/highScoreMode";
import { GameAction } from "@/lib/types";
import { fetchGames } from "@/rpc/api";
import useSWR from "swr";

const tableHeads = ["Game ID", "Player", "Score", "L1 Stats"];

export const PastGames = () => {
  const { data: games = [], isLoading } = useSWR<GameAction[]>(
    "/games",
    fetchGames
  );

  const renderGames = () => {
    if (isLoading) {
      return <p>Loading past games...</p>;
    }

    if (games.length === 0) {
      return (
        <p className="text-muted">
          No games have been played yet. Start a new game to see it here.
        </p>
      );
    }
    return (
      <div className="overflow-x-auto">
        <br />
        <Table className="overflow-y-scroll">
          <TableHeader>
            <TableRow>
              {tableHeads.map((head, idx) => (
                <TableHead className="font-bold" key={idx}>
                  {head}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {games.map(({ gameId, player, score, blockInfo }) => (
              <TableRow key={gameId}>
                <TableCell>{formatHash(gameId)}</TableCell>
                <TableCell>{formatAddress(player)}</TableCell>
                <TableCell align="right">{score}</TableCell>
                <TableCell align="right">
                  <div className="flex gap-2 content-center">
                    <L1Hash l1txHash={blockInfo?.l1TxHash as string} />
                    <ViewMetadata daMetadata={blockInfo?.daMetadata} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2 my-4">
      <p className="font-bold text-2xl">Past Games</p>
      {renderGames()}
    </div>
  );
};
