import { useEffect, useState } from 'react';
import { Button } from 'antd';
import { Parallax } from 'react-parallax';
import { backgrounds } from '~/assets';
import Breadcrumb from '~/components/Breadcrumb';
import Post from '~/components/Post';
import SectionHeader from '~/components/SectionHeader';
import { getNewsArticlesForUser } from '~/services/newsArticlesService';

function News() {
    const [entityData, setEntityData] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        const fetchEntities = async () => {
            setIsLoading(true);
            setErrorMessage(null);
            try {
                const response = await getNewsArticlesForUser();
                const { items } = response.data.data;
                setEntityData(items);
            } catch (error) {
                setErrorMessage(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEntities();
    }, []);

    const items = [
        {
            label: 'Trang chủ',
            url: '/',
        },
        {
            label: 'Danh sách tin tức',
        },
    ];

    return (
        <>
            <Parallax bgImage={backgrounds.bgparallax7} strength={500}>
                <div className="innerbanner">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-auto">
                                <h1>Danh sách tin tức</h1>
                            </div>
                        </div>

                        <div className="row justify-content-center">
                            <div className="col-auto">
                                <Breadcrumb items={items} />
                            </div>
                        </div>
                    </div>
                </div>
            </Parallax>

            <div className="container sectionspace">
                <div className="row mb-4">
                    <div className="col-3">
                        <Button block>Phân loại tin tức</Button>
                    </div>
                    <div className="col-9">
                        <SectionHeader
                            title={<h2 className="mb-0">Danh sách tin tức</h2>}
                            subtitle="Tin tức và bài viết mới nhất"
                        />
                        {isLoading ? (
                            <>Loading</>
                        ) : errorMessage ? (
                            <>{errorMessage}</>
                        ) : (
                            <div className="row">
                                {entityData.map((data, index) => (
                                    <div className="col-12">
                                        <Post className="mx-2 my-1" key={index} data={data} layout="horizontal" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default News;
