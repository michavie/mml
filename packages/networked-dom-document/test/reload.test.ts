import { LocalObservableDomFactory } from "networked-dom-server";

import { MockWebsocket } from "./mock.websocket";
import { EditableNetworkedDOM } from "../src";

let currentDoc: EditableNetworkedDOM | null = null;
afterEach(() => {
  if (currentDoc) {
    currentDoc.dispose();
    currentDoc = null;
  }
});

describe("reloading", () => {
  test("add-within-group-on-reload", async () => {
    const doc = new EditableNetworkedDOM("file://test.html", LocalObservableDomFactory);
    currentDoc = doc;
    doc.load(`
<m-cube color="red"></m-cube>
<m-cube color="green"></m-cube>
<m-cube color="blue"></m-cube>
`);

    const clientWs = new MockWebsocket();
    doc.addWebSocket(clientWs as unknown as WebSocket);

    expect(await clientWs.waitForTotalMessageCount(1)).toEqual([
      [
        {
          documentTime: expect.any(Number),
          snapshot: {
            attributes: {},
            children: [
              {
                attributes: {},
                children: [
                  {
                    attributes: {},
                    children: [],
                    nodeId: 3,
                    tag: "HEAD",
                    type: "element",
                  },
                  {
                    attributes: {},
                    children: [
                      {
                        attributes: {
                          color: "red",
                        },
                        children: [],
                        nodeId: 5,
                        tag: "M-CUBE",
                        type: "element",
                      },
                      {
                        attributes: {
                          color: "green",
                        },
                        children: [],
                        nodeId: 6,
                        tag: "M-CUBE",
                        type: "element",
                      },
                      {
                        attributes: {
                          color: "blue",
                        },
                        children: [],
                        nodeId: 7,
                        tag: "M-CUBE",
                        type: "element",
                      },
                    ],
                    nodeId: 4,
                    tag: "BODY",
                    type: "element",
                  },
                ],
                nodeId: 2,
                tag: "HTML",
                type: "element",
              },
            ],
            nodeId: 1,
            tag: "DIV",
            type: "element",
          },
          type: "snapshot",
        },
      ],
    ]);

    doc.load(`
  <m-group y="2">
    <m-cube color="red"></m-cube>
    <m-cube color="green"></m-cube>
    <m-cube color="blue"></m-cube>
  </m-group>
`);

    expect(await clientWs.waitForTotalMessageCount(2, 1)).toEqual([
      [
        {
          addedNodes: [],
          documentTime: expect.any(Number),
          nodeId: 4,
          previousNodeId: null,
          removedNodes: [5],
          type: "childrenChanged",
        },
        {
          addedNodes: [
            {
              attributes: {
                y: "2",
              },
              children: [
                {
                  attributes: {
                    color: "red",
                  },
                  children: [],
                  nodeId: 9,
                  tag: "M-CUBE",
                  type: "element",
                },
                {
                  attributes: {
                    color: "green",
                  },
                  children: [],
                  nodeId: 10,
                  tag: "M-CUBE",
                  type: "element",
                },
                {
                  attributes: {
                    color: "blue",
                  },
                  children: [],
                  nodeId: 8,
                  tag: "M-CUBE",
                  type: "element",
                },
              ],
              nodeId: 5,
              tag: "M-GROUP",
              type: "element",
            },
          ],
          nodeId: 4,
          previousNodeId: null,
          removedNodes: [],
          type: "childrenChanged",
        },
        {
          addedNodes: [],
          nodeId: 4,
          previousNodeId: 5,
          removedNodes: [6],
          type: "childrenChanged",
        },
        {
          addedNodes: [],
          nodeId: 4,
          previousNodeId: 5,
          removedNodes: [7],
          type: "childrenChanged",
        },
      ],
    ]);
  });

  test("move-to-within-group-on-reload", async () => {
    const doc = new EditableNetworkedDOM("file://test.html", LocalObservableDomFactory);
    currentDoc = doc;
    doc.load(`
<m-plane color="blue" width="20" height="20" rx="-90"></m-plane>
<m-group y="2">
  <m-label id="some-label" width="2" y="4"></m-label>
</m-group>
<script>
  // Empty in this version
</script>
`);

    const clientWs = new MockWebsocket();
    doc.addWebSocket(clientWs as unknown as WebSocket);

    expect(await clientWs.waitForTotalMessageCount(1)).toEqual([
      [
        {
          documentTime: expect.any(Number),
          snapshot: {
            attributes: {},
            children: [
              {
                attributes: {},
                children: [
                  {
                    attributes: {},
                    children: [],
                    nodeId: 3,
                    tag: "HEAD",
                    type: "element",
                  },
                  {
                    attributes: {},
                    children: [
                      {
                        attributes: {
                          color: "blue",
                          height: "20",
                          rx: "-90",
                          width: "20",
                        },
                        children: [],
                        nodeId: 5,
                        tag: "M-PLANE",
                        type: "element",
                      },
                      {
                        attributes: {
                          y: "2",
                        },
                        children: [
                          {
                            attributes: {
                              id: "some-label",
                              width: "2",
                              y: "4",
                            },
                            children: [],
                            nodeId: 7,
                            tag: "M-LABEL",
                            type: "element",
                          },
                        ],
                        nodeId: 6,
                        tag: "M-GROUP",
                        type: "element",
                      },
                    ],
                    nodeId: 4,
                    tag: "BODY",
                    type: "element",
                  },
                ],
                nodeId: 2,
                tag: "HTML",
                type: "element",
              },
            ],
            nodeId: 1,
            tag: "DIV",
            type: "element",
          },
          type: "snapshot",
        },
      ],
    ]);

    doc.load(`
<m-group y="2">
  <m-plane color="blue" width="20" height="20" rx="-90"></m-plane>
  <m-label id="some-label" width="2" y="4"></m-label>
</m-group>
<script>
  setTimeout(() => {
    document
      .getElementById("some-label")
      .setAttribute("content", "Updated in version two");
  }, 500);
</script>
`);

    expect(await clientWs.waitForTotalMessageCount(2, 1)).toEqual([
      [
        {
          // Removes the original m-plane (5) from the BODY (4)
          addedNodes: [],
          documentTime: expect.any(Number),
          nodeId: 4, // BODY
          previousNodeId: null,
          removedNodes: [5],
          type: "childrenChanged",
        },
        {
          // Adds a new m-group (5) to the BODY (4)
          addedNodes: [
            {
              attributes: {
                y: "2",
              },
              children: [
                {
                  attributes: {
                    color: "blue",
                    height: "20",
                    rx: "-90",
                    width: "20",
                  },
                  children: [],
                  nodeId: 8,
                  tag: "M-PLANE",
                  type: "element",
                },
                {
                  attributes: {
                    id: "some-label",
                    width: "2",
                    y: "4",
                  },
                  children: [],
                  nodeId: 9,
                  tag: "M-LABEL",
                  type: "element",
                },
              ],
              nodeId: 5,
              tag: "M-GROUP",
              type: "element",
            },
          ],
          nodeId: 4,
          previousNodeId: null,
          removedNodes: [],
          type: "childrenChanged",
        },
        {
          // Removes the original m-group (6) from the BODY (4)
          addedNodes: [],
          nodeId: 4,
          previousNodeId: 5,
          removedNodes: [6],
          type: "childrenChanged",
        },
      ],
    ]);

    expect(await clientWs.waitForTotalMessageCount(3, 2)).toEqual([
      [
        {
          attribute: "content",
          newValue: "Updated in version two",
          nodeId: 9,
          type: "attributeChange",
        },
      ],
    ]);
  });
});
