'use client'

const ENGINE_API_ADDRESS = "/api/analysis"

export interface AnalysisRequest {
    position: string;
    movetime?: number;
    depth?: number;
}

export interface AnalysisResponse {
    depth: number;
    pv: string[];
    eval: string;
    nps: number;
    error?: string;
}

export interface EngineMove {
  boardIndex: number;
  cellIndex: number;
  evaluation: string;
  depth: number;
  principalVariation: string[];
}

function IsInstance<T>(obj: any, requiredKeys: (keyof T)[], keys: (keyof T)[]) : boolean {
    if (typeof obj != 'object' || obj == null) {
        return false;
    }

    return requiredKeys.every((key) => key in obj) &&
        (Object.keys(obj) as (keyof T)[]).every(key => keys.includes(key)) ;
}

export class EngineAPI {

    static IndexMapper: Map<string, number> = new Map([
        ['a3', 0], ['b3', 1], ['c3', 2], 
        ['a2', 3], ['b2', 4], ['c2', 5], 
        ['a1', 6], ['b1', 7], ['c1', 8], 
    ])

    static async analyze(request: AnalysisRequest = {position: ""}): Promise<EngineMove[]> {
        let response = fetch(
            ENGINE_API_ADDRESS, {
                method: "POST", 
                headers: {"Content-Type": "application/json"}, 
                body: JSON.stringify(request)
        })

        return response.then((resp) => {
            return resp.json()  
        }).then((json) => {
            if (!IsInstance<AnalysisResponse>(json, ['eval', 'nps', 'pv', 'depth'], ['error', 'nps', 'pv', 'eval', 'depth'])) {
                throw new Error("Invalid json structure, got:" + json.toString());
            }

            let engineResp: EngineMove;

            // Convert all moves 
            let boardIndex: number | undefined = this.IndexMapper.get(json.pv[0].substring(0, 2).toLowerCase());
            if (boardIndex == undefined) {
                boardIndex = 0
            }

            let cellIndex: number | undefined = this.IndexMapper.get(json.pv[0].substring(2, 4))
            if (cellIndex == undefined) {
                cellIndex = 0;
            }

            engineResp = {
                depth: json.depth,
                evaluation: json.eval,
                boardIndex,
                cellIndex,
                principalVariation: json.pv
            }

            return new Array<EngineMove>(1).fill(engineResp);
        }).catch((err) => {
            console.log(err)
            return new Array<EngineMove>(0);
        })
    }
}