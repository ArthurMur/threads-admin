import { DataProvider, fetchUtils } from "react-admin";
import { stringify } from "query-string";
import axios from "axios";

// URL API для взаимодействия с сервером
const apiUrl = "http://localhost:3000/api/admin";

// Функция HTTP-клиента для выполнения запросов к API
const httpClient = fetchUtils.fetchJson;

export default {
  // Получение списка ресурсов
  getList: async (resource, params) => {
    // Извлечение параметров пагинации и сортировки из запроса
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    // Формирование запроса для получения списка ресурсов с учетом пагинации, сортировки и фильтрации
    const query = {
      sort: JSON.stringify([field, order]),
      range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
      filter: JSON.stringify(params.filter),
    };
    const url = `${apiUrl}/${resource}/list?${stringify(query)}`;
    // Выполнение запроса к API и получение данных
    const { data } = await axios.get(url);
    console.log(data);

    // Возвращение данных о ресурсах и общего количества ресурсов
    return {
      data: data.items,
      total: data.count,
    };
  },

  // Получение одного ресурса по его идентификатору
  getOne: async (resource, params) => {
    // Извлечение категории из локального хранилища
    const category = JSON.parse(localStorage.getItem("show") as string);
    // Формирование URL для запроса
    const url = `${apiUrl}/${resource}/one?id=${params.id}&category=${category}`;

    // Выполнение запроса к API и получение данных о ресурсе
    const { data } = await axios.get(url);

    // Возвращение данных о ресурсе
    return {
      data: data.productItem,
    };
  },

  // Получение нескольких ресурсов по их идентификаторам
  getMany: async (resource, params) => {
    // Формирование запроса для получения нескольких ресурсов по их идентификаторам
    const query = {
      filter: JSON.stringify({ ids: params.ids }),
    };
    const url = `${apiUrl}/${resource}?${stringify(query)}`;
    const { json } = await httpClient(url);
    // Возвращение данных о ресурсах
    return { data: json };
  },

  // Получение нескольких ресурсов по их идентификаторам с учетом ссылки на родительский ресурс
  getManyReference: async (resource, params) => {
    // Извлечение параметров пагинации, сортировки и фильтрации из запроса
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    // Формирование запроса для получения нескольких ресурсов с учетом ссылки на родительский ресурс
    const query = {
      sort: JSON.stringify([field, order]),
      range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
      filter: JSON.stringify({
        ...params.filter,
        [params.target]: params.id,
      }),
    };
    const url = `${apiUrl}/${resource}?${stringify(query)}`;
    const { json, headers } = await httpClient(url);
    // Возвращение данных о ресурсах и общего количества ресурсов
    return {
      data: json,
      total: parseInt(headers.get("content-range")!.split("/").pop()!, 10),
    };
  },

  // Создание нового ресурса
  create: async (resource, params) => {
    // Выполнение запроса на создание нового ресурса
    const { json } = await httpClient(`${apiUrl}/${resource}`, {
      method: "POST",
      body: JSON.stringify(params.data),
    });
    // Возвращение данных о созданном ресурсе
    return { data: json };
  },

  // Обновление ресурса по его идентификатору
  update: async (resource, params) => {
    // Формирование URL для запроса на обновление ресурса
    const url = `${apiUrl}/${resource}/${params.id}`;
    // Выполнение запроса на обновление ресурса
    const { json } = await httpClient(url, {
      method: "PUT",
      body: JSON.stringify(params.data),
    });
    // Возвращение данных об обновленном ресурсе
    return { data: json };
  },

  // Обновление нескольких ресурсов по их идентификаторам
  updateMany: async (resource, params) => {
    // Формирование запроса на обновление нескольких ресурсов
    const query = {
      filter: JSON.stringify({ id: params.ids }),
    };
    const url = `${apiUrl}/${resource}?${stringify(query)}`;
    const { json } = await httpClient(url, {
      method: "PUT",
      body: JSON.stringify(params.data),
    });
    // Возвращение данных об обновленных ресурсах
    return { data: json };
  },

  // Удаление ресурса по его идентификатору
  delete: async (resource, params) => {
    // Получение идентификатора и категории ресурса из предыдущих данных
    const id = params.previousData && params.previousData.id;
    const category = params.previousData && params.previousData.category;
    // Формирование URL для запроса на удаление ресурса
    const url = `${apiUrl}/${resource}/delete?id=${id}&category=${category}`;

    // Выполнение запроса на удаление ресурса
    const { data } = await axios.get(url);

    // Возвращение данных об удаленном ресурсе
    return {
      data,
    };
  },

  // Удаление нескольких ресурсов по их идентификаторам
  deleteMany: async (resource, params) => {
    // Формирование URL для запроса на удаление нескольких ресурсов
    const url = `${apiUrl}/${resource}/delete-many?ids=${JSON.stringify(
      params.ids
    )}`;

    // Выполнение запроса на удаление нескольких ресурсов
    await axios.get(url);

    // Возвращение пустых данных
    return {
      data: [],
    };
  },
} as DataProvider;
