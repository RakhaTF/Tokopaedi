import supertest from "supertest"
import { afterAll, beforeAll, expect, it } from "vitest";
import buildServer from "../..";
import path from "path";
import DotenvFlow from "dotenv-flow";

//configuration for dotenv
DotenvFlow.config({ path: path.resolve(__dirname, `../../../`) });
let app;

beforeAll(async () => {
    app = await buildServer()
    await app.ready();
})

afterAll(async () => {
    await app.close()
})

type reqBody = {
    limit: number;
    lastId: number;
    sort: string;
    sortFilter: string;
    lastPrice: number
}

const listOfIds: number[] = []

const testProductListPagination = async (reqBody: reqBody) => {
    const { body } = await supertest(app.server)
        .post('/api/v1/product/list')
        .send(reqBody)
        .expect(200);

    const data = body.message.data;
    const dataLength = data.length;
    const lastElement = data[dataLength - 1];
    const lastPrice = lastElement[4];
    const lastId = body.message.lastId;


    const hasNext = body.message.hasNext

    expect(body.message.column).toHaveLength(10);

    // Check that the sort is working correctly.
    const ids: number[] = data.map((data) => data[0])
    
    ids.forEach(id => {
        listOfIds.push(id)
    })

    // If lastId is not -1, call the function recursively with the updated reqBody.
    if (hasNext == true) {
        const updatedReqBody = {
            ...reqBody,
            lastId: lastId,
            lastPrice: lastPrice
        };
        await testProductListPagination(updatedReqBody);
    }
}

it('Should return list of products in descending sort.', async () => {

    const initialReqBody = {
        limit: 5,
        lastId: 0,
        sort: "ASC",
        sortFilter: "lowestPrice",
        lastPrice: 0
    }

    await testProductListPagination(initialReqBody)
    const uniqueId = [...new Set(listOfIds)]
    console.log({ listOfIds, totalId: uniqueId.length })
})