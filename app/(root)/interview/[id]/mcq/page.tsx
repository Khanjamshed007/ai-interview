import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import {
    getFeedbackByInterviewId,
    getInterviewById,
} from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";
import './styles.css'
import McqClient from "./McqClient";



const Mcq = async ({ params }: RouteParams) => {
    const { id } = await params;
    console.log(id)
    const user = await getCurrentUser();

    const interview = await getInterviewById(id);
    if (!interview) redirect("/");
    console.log(interview);

    return <McqClient interview={interview} id={id} />;
};

export default Mcq;
