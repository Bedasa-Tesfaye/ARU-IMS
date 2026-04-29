import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Card, Button, Row, Col, Spinner, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { internshipAPI } from '../services/api';

const PublicInternships = () => {
    const [filters, setFilters] = useState({ type: '', location: '' });

    const { data: internships, isLoading, error } = useQuery(
        ['public-internships', filters],
        () => internshipAPI.getPublicInternships(filters),
        { keepPreviousData: true }
    );

    const internshipsList = React.useMemo(() => {
        const payload = internships?.data;

        if (Array.isArray(payload)) {
            return payload;
        }

        if (Array.isArray(payload?.data)) {
            return payload.data;
        }

        return [];
    }, [internships]);

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value,
        });
    };

    const getTypeBadge = (type) => {
        const variants = {
            'full-time': 'primary',
            'part-time': 'secondary',
            'remote': 'success',
            'hybrid': 'info'
        };
        return <Badge bg={variants[type] || 'secondary'}>{type.replace('-', ' ')}</Badge>;
    };

    if (error) {
        return (
            <section id="internships" className="py-5 bg-light">
                <div className="container">
                    <Alert variant="danger">Error loading internships: {error.message}</Alert>
                </div>
            </section>
        );
    }

    return (
        <section id="internships" className="py-5 bg-light">
            <div className="container">
                <div className="text-center mb-5">
                    <h2 className="section-title">Available <span className="text-gradient">Internships</span></h2>
                    <p className="section-subtitle">Discover exciting opportunities posted by leading companies</p>
                </div>

                {/* Filters */}
                <div className="mb-4">
                    <Row className="justify-content-center">
                        <Col md={3}>
                            <select
                                className="form-select"
                                name="type"
                                value={filters.type}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Types</option>
                                <option value="full-time">Full-time</option>
                                <option value="part-time">Part-time</option>
                                <option value="remote">Remote</option>
                                <option value="hybrid">Hybrid</option>
                            </select>
                        </Col>
                        <Col md={3}>
                            <input
                                type="text"
                                className="form-control"
                                name="location"
                                value={filters.location}
                                onChange={handleFilterChange}
                                placeholder="Location"
                            />
                        </Col>
                    </Row>
                </div>

                {isLoading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" />
                    </div>
                ) : (
                    <>
                        <Row>
                            {internshipsList.slice(0, 6).map((internship) => (
                                <Col md={6} lg={4} className="mb-4" key={internship.id}>
                                    <Card className="h-100 shadow-sm internship-card">
                                        <Card.Body className="d-flex flex-column">
                                            <div className="mb-2">
                                                <h6 className="mb-1 text-truncate">{internship.title}</h6>
                                                <p className="text-muted small mb-2">{internship.company?.name}</p>
                                            </div>

                                            <div className="mb-3">
                                                {getTypeBadge(internship.type)}
                                            </div>

                                            <p className="flex-grow-1 small text-muted">
                                                {internship.description?.substring(0, 100)}
                                                {internship.description?.length > 100 && '...'}
                                            </p>

                                            <div className="mb-3">
                                                <div className="d-flex justify-content-between small text-muted">
                                                    <span>📍 {internship.location}</span>
                                                    <span>⏱️ {internship.duration_weeks} weeks</span>
                                                </div>
                                                <div className="d-flex justify-content-between small text-muted mt-1">
                                                    <span>💰 {internship.stipend ? `$${internship.stipend}` : 'Unpaid'}</span>
                                                    <span>👥 {internship.current_applicants || 0}/{internship.max_applicants}</span>
                                                </div>
                                            </div>

                                            <div className="d-flex justify-content-between align-items-center">
                                                <small className="text-muted">
                                                    Starts: {new Date(internship.start_date).toLocaleDateString()}
                                                </small>
                                                <a href="mailto:admin@aru.edu.et" className="btn btn-primary btn-sm">
                                                    Contact Admin
                                                </a>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>

                        {internshipsList.length === 0 && (
                            <Alert variant="info" className="text-center">
                                No internships found matching your criteria.
                            </Alert>
                        )}

                        {internshipsList.length > 6 && (
                            <div className="text-center mt-4">
                                <a href="mailto:admin@aru.edu.et" className="btn btn-outline-primary">
                                    Contact Admin for More ({internships?.total || internshipsList.length}+)
                                </a>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
};

export default PublicInternships;