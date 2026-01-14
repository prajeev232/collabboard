package com.prajeev.collabboard;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.val;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.containers.PostgreSQLContainer;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Testcontainers
@SpringBootTest
@AutoConfigureMockMvc
public class BoardApiIT {
    @Container
    static PostgreSQLContainer<?> postgres =
            new PostgreSQLContainer<>("postgres:16")
                    .withDatabaseName("collabboard")
                    .withUsername("collab")
                    .withPassword("collab");

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.flyway.enabled", () -> true);
    }

    @Autowired
    MockMvc mvc;

    private final ObjectMapper objectMapper = new ObjectMapper();
    @Test
    void createBoard_returns201_andPayload() throws Exception {
        mvc.perform(post("/boards")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\": \"My board\"}"))
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.name").value("My board"));
    }

    @Test
    void getSnapshot_returns200_withEmptyListsAndCards() throws Exception {
        MvcResult res = mvc.perform(post("/boards")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\": \"My board\"}"))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode created = objectMapper.readTree(res.getResponse().getContentAsString());
        String boardId = created.get("id").asText();

        mvc.perform(get("/boards/{boardId}", boardId))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.board.id").value(boardId))
                .andExpect(jsonPath("$.board.name").value("My board"))
                .andExpect(jsonPath("$.lists").isArray())
                .andExpect(jsonPath("$.lists.length()").value(0))
                .andExpect(jsonPath("$.cardsByListId").isMap())
                .andExpect(jsonPath("$.cardsByListId").isEmpty());
    }

    @Test
    void getSnapshot_unknownBoard_returns404() throws Exception {
        mvc.perform(get("/boards/{boardId}", "00000000-0000-0000-0000-000000000000"))
                .andExpect(status().isNotFound());
    }

    @Test
    void createList_assignsPositionsStartingAtZero() throws Exception {
        MvcResult createBoard = mvc.perform(post("/boards")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"My board\"}"))
                .andExpect(status().isCreated())
                .andReturn();

        String boardId = idFromLocation(createBoard);

        mvc.perform(post("/boards/{boardId}/lists", boardId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Todo\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.boardId").value(boardId))
                .andExpect(jsonPath("$.name").value("Todo"))
                .andExpect(jsonPath("$.position").value(0));

        mvc.perform(post("/boards/{boardId}/lists", boardId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Doing\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.position").value(1));
    }

    @Test
    void snapshot_includesListsOrderedByPosition() throws Exception {
        String boardId = idFromLocation(
                mvc.perform(post("/boards")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"name\":\"My board\"}"))
                        .andReturn()
        );

        mvc.perform(post("/boards/{boardId}/lists", boardId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Todo\"}"))
                .andExpect(status().isCreated());

        mvc.perform(post("/boards/{boardId}/lists", boardId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Doing\"}"))
                .andExpect(status().isCreated());

        mvc.perform(get("/boards/{boardId}", boardId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lists.length()").value(2))
                .andExpect(jsonPath("$.lists[0].name").value("Todo"))
                .andExpect(jsonPath("$.lists[0].position").value(0))
                .andExpect(jsonPath("$.lists[1].name").value("Doing"))
                .andExpect(jsonPath("$.lists[1].position").value(1))
                .andExpect(jsonPath("$.cardsByListId").isMap());
    }

    @Test
    void createList_onUnknownBoard_returns404() throws Exception {
        mvc.perform(post("/boards/{boardId}/lists", "00000000-0000-0000-0000-000000000000")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Todo\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void createCard_assignsPositionsStartingAtZero() throws Exception {
        String boardId = idFromLocation(
                mvc.perform(post("/boards")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"name\":\"My board\"}"))
                        .andExpect(status().isCreated())
                        .andReturn()
        );

        // create a list
        MvcResult createList = mvc.perform(post("/boards/{boardId}/lists", boardId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Todo\"}"))
                .andExpect(status().isCreated())
                .andReturn();
        String listId = idFromLocation(createList);

        // create first card
        mvc.perform(post("/lists/{listId}/cards", listId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Task 1\",\"description\":\"d1\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.listId").value(listId))
                .andExpect(jsonPath("$.title").value("Task 1"))
                .andExpect(jsonPath("$.description").value("d1"))
                .andExpect(jsonPath("$.position").value(0))
                .andExpect(jsonPath("$.version").value(1));

        // create second card
        mvc.perform(post("/lists/{listId}/cards", listId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Task 2\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.position").value(1))
                .andExpect(jsonPath("$.description").value("")); // default to empty
    }

    @Test
    void snapshot_includesCardsGroupedByListId_andOrderedByPosition() throws Exception {
        String boardId = idFromLocation(
                mvc.perform(post("/boards")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"name\":\"My board\"}"))
                        .andExpect(status().isCreated())
                        .andReturn()
        );

        String todoListId = idFromLocation(
                mvc.perform(post("/boards/{boardId}/lists", boardId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"name\":\"Todo\"}"))
                        .andExpect(status().isCreated())
                        .andReturn()
        );

        String doingListId = idFromLocation(
                mvc.perform(post("/boards/{boardId}/lists", boardId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"name\":\"Doing\"}"))
                        .andExpect(status().isCreated())
                        .andReturn()
        );

        // cards in Todo
        mvc.perform(post("/lists/{listId}/cards", todoListId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"T1\"}"))
                .andExpect(status().isCreated());

        mvc.perform(post("/lists/{listId}/cards", todoListId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"T2\"}"))
                .andExpect(status().isCreated());

        // card in Doing
        mvc.perform(post("/lists/{listId}/cards", doingListId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"D1\"}"))
                .andExpect(status().isCreated());

        mvc.perform(get("/boards/{boardId}", boardId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lists.length()").value(2))

                // Todo list cards
                .andExpect(jsonPath("$.cardsByListId['" + todoListId + "'].length()").value(2))
                .andExpect(jsonPath("$.cardsByListId['" + todoListId + "'][0].title").value("T1"))
                .andExpect(jsonPath("$.cardsByListId['" + todoListId + "'][0].position").value(0))
                .andExpect(jsonPath("$.cardsByListId['" + todoListId + "'][1].title").value("T2"))
                .andExpect(jsonPath("$.cardsByListId['" + todoListId + "'][1].position").value(1))

                // Doing list cards
                .andExpect(jsonPath("$.cardsByListId['" + doingListId + "'].length()").value(1))
                .andExpect(jsonPath("$.cardsByListId['" + doingListId + "'][0].title").value("D1"))
                .andExpect(jsonPath("$.cardsByListId['" + doingListId + "'][0].position").value(0));
    }

    @Test
    void createCard_onUnknownList_returns404() throws Exception {
        mvc.perform(post("/lists/{listId}/cards", "00000000-0000-0000-0000-000000000000")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Task 1\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void patchCard_updatesTitleAndDescription() throws Exception {
        String boardId = idFromLocation(
                mvc.perform(post("/boards")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"name\":\"My board\"}"))
                        .andExpect(status().isCreated())
                        .andReturn()
        );

        String listId = idFromLocation(
                mvc.perform(post("/boards/{boardId}/lists", boardId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"name\":\"Todo\"}"))
                        .andExpect(status().isCreated())
                        .andReturn()
        );

        MvcResult createCard = mvc.perform(post("/lists/{listId}/cards", listId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"T1\",\"description\":\"d1\"}"))
                .andExpect(status().isCreated())
                .andReturn();

        String cardId = idFromLocation(createCard);

        mvc.perform(patch("/cards/{cardId}", cardId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"T1 updated\",\"description\":\"d1 updated\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(cardId))
                .andExpect(jsonPath("$.title").value("T1 updated"))
                .andExpect(jsonPath("$.description").value("d1 updated"))
                .andExpect(jsonPath("$.version").value(2)); // we will bump version on every edit
    }

    @Test
    void patchCard_unknownCard_returns404() throws Exception {
        mvc.perform(patch("/cards/{cardId}", "00000000-0000-0000-0000-000000000000")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"x\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void createBoard_blankName_returns400_withErrorPayload() throws Exception {
        mvc.perform(post("/boards")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"   \"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.path").value("/boards"))
                .andExpect(jsonPath("$.fieldErrors.name").isNotEmpty());
    }

    @Test
    void createBoard_malformedJson_returns400_withErrorPayload() throws Exception {
        mvc.perform(post("/boards")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":"))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.error").value("MALFORMED_JSON"))
                .andExpect(jsonPath("$.path").value("/boards"));
    }

    @Test
    void cors_preflight_allowsLocalhost5173() throws Exception {
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options("/boards")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "Content-Type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
    }

//    ************* HELPER METHODS **************

    private static String idFromLocation(MvcResult res) {
        String location = res.getResponse().getHeader("Location");
        return location.substring(location.lastIndexOf('/') + 1);
    }
}
