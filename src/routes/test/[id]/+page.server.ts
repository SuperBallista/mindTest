import { error } from '@sveltejs/kit';
import { AppDataSource } from '$lib/ormconfig';
import { Post } from '$lib/entities/Post';
import dotenv from "dotenv"
import { User } from '$lib/entities/User.js';

dotenv.config();

export async function load({ params }) {
    // ✅ DB가 초기화되지 않았으면 초기화
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }

    const postRepository = AppDataSource.getRepository(Post);
    const userRepository = AppDataSource.getRepository(User);
    const postId = params.id;


    // ✅ 테스트 데이터 가져오기
    const post = await postRepository.findOne({
        where: { id: postId }  });


        if (!post) {
            throw new Error("게시글 또는 작성자 정보를 찾을 수 없습니다.");
        } else
        {    post.content.id = postId;} // ✅ post.content가 존재할 때만 할당

        const userData = await userRepository.findOne({ where: { id: post?.user?.id } });

        

    // ✅ 테스트가 존재하지 않을 경우 404 에러 반환
    if (!post) {
        throw error(404, 'post not found');
    }



    return { 
        domain: process.env.BASE_URL,
        user: userData?.username,
        userId: userData?.id,
        writerId: post.user,
        id: post.id,
        content: post.content,
        title: post.title,
        image: post.image,
        description: post.description,
        viewCount: post.views,
        likeCount: post.likes,
        dislikeCount: post.dislikes,
    };
}
