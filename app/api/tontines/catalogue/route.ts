import { NextResponse } from "next/server";
import { tontinesService } from "@/services/tontines.service";
export async function GET() { return NextResponse.json({ donnees: await tontinesService.catalogue() }); }
