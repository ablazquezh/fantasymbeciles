import React, { useEffect, useState } from 'react'
import type { GetServerSidePropsContext, GetServerSidePropsResult, NextPage } from 'next'
import VerticalLayoutTextboxSearch from '../@components/layout/VerticalLayoutTextboxSearch'
import { useRouter } from "next/router";

interface PlayerSelectProps {
}

const PlayerSelectionPage: NextPage<PlayerSelectProps> = () => {
    const router = useRouter();
    const { leagueId } = router.query;
    const [league, setLeague] = useState<string | null>(null);

    useEffect(() => {
        if (leagueId) {
            setLeague(leagueId as string);
        }
    }, [leagueId]);

    return (
  
      <VerticalLayoutTextboxSearch sx={{ width: "60%" }}>
        {league ? <p>League ID: {league}</p> : <p>Loading...</p>}
      </VerticalLayoutTextboxSearch>
    )
  }
  
  export default PlayerSelectionPage
  