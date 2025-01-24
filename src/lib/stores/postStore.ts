
import { writable } from 'svelte/store';


// 게시판 페이지 상태 관련 변수
export const currentPage = writable(1);
export const  list = writable([]);
export const  loading = writable(true);
export const category = writable<"기타"|"연애"|"성격">("기타");
export const totalPages = writable(1);
export const isEditMode = writable<number | null> (null)


// ✅ 게시글 데이터를 가져오는 전역 함수
export async function fetchPosts(selectedCategory: string, page: number) {
    loading.set(true);
    try {
        const response = await fetch(`/api/posts?category=${selectedCategory}&page=${page}`);
        const data = await response.json();

        if (data) {
            category.set(data.category);
            list.set(data.list);
            currentPage.set(data.currentPage);
            totalPages.set(data.totalPages);
        }
    } catch (error) {
        console.error("❌ 데이터 불러오기 오류:", error);
    } finally {
        loading.set(false);
    }
}